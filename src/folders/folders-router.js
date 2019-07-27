const express=require('express');
const logger=require('../logger');
const foldersService=require('./folders-service');
const xss=require('xss');


const foldersRouter=express.Router();
const bodyParser=express.json();

const serializefolder = folder => ({
  id:folder.id,
  folder_name: xss(folder.folder_name),
  

});


foldersRouter

  .route('/')
  .get((req,res,next)=>{
    foldersService.getAllFolders(req.app.get('db'))
      .then(folder=>{
        res.json(folder.map(serializefolder));
      })
      .catch(next);
  })

  .post(bodyParser,(req,res,next)=>{
    for (const field of ['folder_name']){
      if(!req.body[field]){
        logger.error(`${field} is required`);
        return res.status(400).send(`'${field}'is required`);
      }
    }

    const {folder_name}=req.body;
    

    if(Number.isInteger(folder_name)||folder_name.length <1){
      logger.error(`Invalid folder_name '${folder_name}' supplied`);
      return res.status(400).send('folder_name must be text and have a length of character greater than 0');
    }

    const newFolder={folder_name};

    foldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder=>{
        logger.info(`Folder with id ${folder.id} has been created`);
        res
          .status(201)
          .location(`/folder/${folder.id}`)
          .json(serializefolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route('/:folder_id')
  .all((req,res,next)=>{
    const {folder_id}=req.params;
    foldersService.getById(req.app.get('db'),folder_id)

      .then(folder=>{
        if(!folder){
          logger.error(`Folder with id ${folder_id} not found`);
          return res.status(404).json({
            error:{message:'Folder not Found'}
          });
        }
        res.folder=folder;
        next();
      })
      .catch(next);
  })
  .get((req,res)=>{
    res.json(serializefolder(res.folder));
  })

  .delete((req,res,next)=>{
    const {folder_id}=req.params;
    foldersService.deleteFolder(
      req.app.get('db'),
      folder_id
    )

      .then(()=>{
        logger.info(`Folder with id ${folder_id}deleted`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser,(req,res,next)=>{
    const {folder_name}=req.body;
    const folderToUpdate={folder_name};
    const {folder_id}=req.params;
    foldersService.updateFolder(
      req.app.get('db'),
      folder_id,
      folderToUpdate
    )

    
      .then((folder)=>{
        // if(!folder){
        //   return res.status(404).json({error:{message:'Folder not found'}});
        // }
        console.log(folder);
        res.status(204).end();
      })
      .catch(next);
  });
  
      

      
  
      


module.exports=foldersRouter;