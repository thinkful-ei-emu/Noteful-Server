function makeFoldersArray(){
  return [{
    id:1,folder_name:'No Thinky'
  },{
    id:2,folder_name:'Some Thinky'
  },
  {
    id:3,folder_name:'Im Lost'
  }];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    
    id:1,
    folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    
  }
  const expectedFolder = {
    ...maliciousFolder,
    id:1,
    folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    
  }
  return {
    maliciousFolder,
    expectedFolder,
  }
}



module.exports={makeFoldersArray,makeMaliciousFolder};