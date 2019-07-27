const express=require('express');
const logger=require('../logger');
const NotesService=require('./notes-service');
const xss=require('xss');


const notesRouter=express.Router();
const bodyParser=express.json();
const serializeNotes=note=>({
  id:note.id,
  note_name:xss(note.note_name),
  description:xss(note.description),
  modified_date:note.modified_date,
  note_id:note.note_id,



});
notesRouter

  .route('/')
  .get((req,res,next)=>{
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes=>{
        res.json(notes.map(serializeNotes));
      })
      .catch(next);
  })

  .post(bodyParser,(req,res,next)=>{
    for (const field of ['note_name']){
      if(!req.body[field]){
        logger.error(`${field} is required`);
        return res.status(400).send(`'${field}'is required`);
      }
    }

    const {note_name,description,folder_id}=req.body;
    

    if(Number.isInteger(note_name)||note_name.length <1){
      logger.error(`Invalid note_name '${note_name}' supplied`);
      return res.status(400).send('note_name must be text and have a length of character greater than 0');
    }

    const newnote={note_name,description,folder_id};

    NotesService.insertNote(
      req.app.get('db'),
      newnote
    )
      .then(note=>{
        logger.info(`note with id ${note.id} has been created`);
        res
          .status(201)
          .location(`/note/${note.id}`)
          .json(serializeNotes(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req,res,next)=>{
    const {note_id}=req.params;
    NotesService.getById(req.app.get('db'),note_id)

      .then(note=>{
        if(!note){
          logger.error(`note with id ${note_id} not found`);
          return res.status(400).json({
            error:{message:'Note not Found'}
          });
        }
        res.note=note;
        next();
      })
      .catch(next);
  })
  .get((req,res)=>{
    res.json(res.note);
  })

  .delete((req,res,next)=>{
    const {note_id}=req.params;
    NotesService.deleteNote(
      req.app.get('db'),
      note_id
    )

      .then(()=>{
        logger.info(`note with id ${note_id}deleted`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser,(req,res,next)=>{
    const {note_name}=req.body;
    const noteToUpdate={note_name};
    const {note_id}=req.params;
    NotesService.updateNote(
      req.app.get('db'),
      note_id,
      noteToUpdate
    )
      .then(()=>{
        res.status(204).end();
      })
      .catch(next);
  });
  
      

      
  
      


module.exports=notesRouter;