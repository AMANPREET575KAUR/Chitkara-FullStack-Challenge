async function submitData(){


let text =
document.getElementById("data").value;



let data =
text.split(",")
.map(x=>x.trim())
.filter(x=>x);



try{


let res =
await fetch(
"http://localhost:5000/bfhl",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({
data
})


});



let json =
await res.json();



document.getElementById("result")
.innerText =
JSON.stringify(json,null,2);



}

catch(error){


document.getElementById("result")
.innerText =
"API Error";


}


}