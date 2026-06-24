const express=require("express");
const cors=require("cors");
require("dotenv").config();

const app=express();

app.use(cors());
app.use(express.json());



function createTree(root,children){

    let obj={};

    obj[root]={};


    for(let child of children[root] || []){

        obj[root][child]=
        createTree(child,children)[child];

    }

    return obj;
}





function calculateDepth(node,children){

    if(!children[node] ||
       children[node].length===0)
        return 1;


    let values =
    children[node].map(x=>
        calculateDepth(x,children)
    );


    return 1+Math.max(...values);

}





function processComponent(nodes,edges){


    let parents={};
    let children={};



    for(let [a,b] of edges){


        if(!parents[b]){

            parents[b]=a;


            if(!children[a])
                children[a]=[];


            children[a].push(b);
        }
    }



    let roots =
    nodes.filter(x=>!parents[x]);



    if(roots.length===0){

        roots=[
            [...nodes].sort()[0]
        ];
    }



    let root=roots[0];



    let visiting=new Set();



    function cycleCheck(node){


        if(visiting.has(node))
            return true;


        visiting.add(node);



        for(let c of children[node]||[]){

            if(cycleCheck(c))
                return true;

        }


        visiting.delete(node);

        return false;
    }



    if(cycleCheck(root)){


        return {

            root,

            tree:{},

            has_cycle:true
        };

    }




    return {

        root,

        tree:createTree(root,children),

        depth:calculateDepth(root,children)

    };

}






app.post("/bfhl",(req,res)=>{


let input = req.body?.data;

if(!input){
    return res.status(400).json({
        error:"data array is required"
    });
}

if(!Array.isArray(input)){

return res.status(400).json({
error:"data must be array"
});

}



let invalid_entries=[];
let duplicate_edges=[];

let unique=[];
let seen=new Set();



for(let item of input){


let original=item;

item=String(item).trim();



let valid =
/^[A-Z]->[A-Z]$/.test(item);



if(!valid || item==="A->A"){

invalid_entries.push(original);

continue;

}



if(seen.has(item)){


duplicate_edges.push(item);

continue;

}



seen.add(item);


let [a,b]=item.split("->");


unique.push([a,b]);


}




/*
 create connected components
*/

let graph={};


for(let [a,b] of unique){


if(!graph[a])
graph[a]=new Set();


if(!graph[b])
graph[b]=new Set();


graph[a].add(b);
graph[b].add(a);

}





let visited=new Set();

let result=[];



for(let node of Object.keys(graph)){



if(visited.has(node))
continue;



let stack=[node];

let nodes=[];



while(stack.length){


let x=stack.pop();


if(visited.has(x))
continue;


visited.add(x);

nodes.push(x);



for(let n of graph[x])
stack.push(n);


}




let componentEdges =
unique.filter(e=>
nodes.includes(e[0]) &&
nodes.includes(e[1])
);



result.push(
processComponent(
nodes,
componentEdges
)
);



}





let trees =
result.filter(x=>!x.has_cycle);


let largest="";

let maxDepth=0;



for(let t of trees){


if(
t.depth>maxDepth ||
(
t.depth===maxDepth &&
t.root<largest
)
){

maxDepth=t.depth;

largest=t.root;

}

}





res.json({

user_id:process.env.USER_ID,

email_id:process.env.EMAIL_ID,

college_roll_number:process.env.ROLL_NUMBER,


hierarchies:result,


invalid_entries,


duplicate_edges,


summary:{


total_trees:trees.length,


total_cycles:
result.length-trees.length,


largest_tree_root:largest


}

});


});





app.listen(5000,()=>{

console.log("API running on 5000");

});