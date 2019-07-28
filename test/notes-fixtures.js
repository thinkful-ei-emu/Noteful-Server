function makeNotesArray(){
  
  const date= new Date().toISOString();
  return [{
    id:1,
    note_name:'No Thinky',
    description:'stuffs',
    folder_id:1,
    modified_date:"2019-07-28T05:00:00.000Z",
  },{
    id:2,
    note_name:'No Thinky',
    description:'stfauffs',
    folder_id:2,
  modified_date:"2019-07-28T05:00:00.000Z"}

   
  ,{
    id:3,
    
    note_name:'No Tahinky',
    description:'stufasfs',
   folder_id:3,
   modified_date:"2019-07-28T05:00:00.000Z"
  }];
}

function makeMaliciousnote() {
  const maliciousnote = {
    
    id:1,
    
    note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    description:'Naughty naughty very naughty <script>alert("xss");</script>',
    folder_id:3
  }
  const expectednote = {
    ...maliciousnote,
    id:1,
    note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description:'Naughty naughty very naughty <script>alert("xss");</script>',
    folder_id:3
    
  }
  return {
    maliciousnote,
    expectednote,
  }
}



module.exports={makeNotesArray,makeMaliciousnote};