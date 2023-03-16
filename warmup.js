
'use strict';
 const StringsArray=["spring","alien","house","o","it","cat","politecnico"];
 for (const word of StringsArray)
 {  
     (word.length>3)?  
     console.log(word[0]+word[1]+word[word.length-2]+word[word.length-1]) : 
     (word.length===2)? console.log(word+word) : 
     (word.length===3)? console.log(word[0]+word[1]+word[1]+word[2]) : 
     console.log(" ") ;
 }

