function makeNotesArray(){
  return [{
    id:1,note_name:'No Thinky'
  },{
    id:2,note_name:'Some Thinky'
  },
  {
    id:3,note_name:'Im Lost'
  }];
}

function makeMaliciousnote() {
  const maliciousnote = {
    
    id:1,
    note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description:''
    
  }
  const expectednote = {
    ...maliciousnote,
    id:1,
    note_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    
  }
  return {
    maliciousnote,
    expectednote,
  }
}



module.exports={makeNotesArray,makeMaliciousnote};