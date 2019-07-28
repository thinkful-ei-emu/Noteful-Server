const knex=require('knex');
const app =require('../src/app');
const {makeMaliciousnote,makeNotesArray}=require('./notes-fixtures');



describe('notes ENDPOINTS',()=>{
  let db;

  before('make knex instance for test',()=>{
    db=knex({
      client:'pg',
      connection:process.env.TESTDBURL,
    });
    app.set('db',db);
  });


  after('disconnnect from db',()=>{

    return db.destroy();
  
  });

  
  afterEach('cleanup',()=>{
    return db.raw('truncate notes,notes RESTART IDENTITY');
  });

  describe('GET /api/notes', () => {
    context('Given no notes', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, []);
      });
    });
  

    context('Given there are notes in the database', () => {
      const testnotes = makeNotesArray();

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testnotes);
      });

      it('gets the notes from the store', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testnotes);
      });
    });
  });
  context('Given an XSS attack note', () => {
    const { maliciousnote, expectednote } =makeMaliciousnote();

    beforeEach('insert malicious note', () => {
      return db
        .into('notes')
        .insert([maliciousnote]);
    });

    it('removes XSS attack content', () => {
      return supertest(app)
        .get('/api/notes')
        .expect(200)
        .expect(res => {
          expect(res.body[0].note_name).to.eql(expectednote.note_name);
           
        });
    });
  });

  describe('GET /api/notes/:id', () => {
    context('Given no notes', () => {
      it('responds 404 whe note doesn\'t exist', () => {
        return supertest(app)
          .get('/api/notes/123')
          
          .expect(404, {
            error: { message: 'note not Found' }
          });
      });
    });

    context('Given there are notes in the database', () => {
      const testnotes = makeNotesArray();

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testnotes);
      });

      it('responds with 200 and the specified note', () => {
        const noteId = 2;
        const expectednote = testnotes[noteId - 1];
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          
          .expect(200, expectednote);
      });
    });

    context('Given an XSS attack note', () => {
      const { maliciousnote, expectednote } = makeMaliciousnote();

      beforeEach('insert malicious note', () => {
        return db
          .into('notes')
          .insert([maliciousnote]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/notes/${maliciousnote.id}`)
          
          .expect(200)
          .expect(res => {
            expect(res.body.note_name).to.eql(expectednote.note_name);
            
          });
      });
    });
  });

  describe('DELETE /api/notes/:id', () => {
    context('Given no notes', () => {
      it('responds 404 whe note doesn\'t exist', () => {
        return supertest(app)
          .delete('/api/notes/123')
         
          .expect(404, {
            error: { message: 'note not Found' }
          });
      });
    });

    context('Given there are notes in the database', () => {
      const testnotes = makeNotesArray();

      beforeEach('insert notes', () => {
        return db
          .into('notes')
          .insert(testnotes);
      });

      it('removes the note by ID from the store', () => {
        const idToRemove = 2;
        const expectednotes = testnotes.filter(bm => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          
          .expect(204)
          .then(() =>
            supertest(app)
              .get('/api/notes')
              
              .expect(expectednotes)
          );
      });
    });
  });

  describe('Patch api/notes/:noteid',()=>{
    context('Given no articles',()=>{
      it('responds with a 404',()=>{
        const noteid=300;
        return supertest(app)
          .patch(`/api/note/${noteid}`)
          
          .expect(404,{});
      });
    });
  });

  context('Given there are notes in the database',()=>{
    const testnotes=makeNotesArray();

    beforeEach('Insert notes',()=>{
      return db 
        .into('notes')
        .insert(testnotes);
    });
    it('responds with 204 and updates the articles',()=>{
      const idtoUpdate=2;
      const updatenote=
      {
        note_name:'blahblahb',
        
      };
      return supertest(app)
        .patch(`/api/notes/${idtoUpdate}`)
        .send(updatenote)
        .expect(204);
    });
  });

  describe('POST /api/notes', () => {
    it('responds with 400 missing \'note_name\' if not supplied', () => {
      const newnoteMissingName = {
        // note_name: 'test-name',
        
      };
      return supertest(app)
        .post('/api/notes')
        .send(newnoteMissingName)
        
        .expect(400, '\'note_name\'is required');
    });

    it('adds a new note to the store', () => {
      const newnote = {
        note_name:'YAY',
        description:'stuffs',
        folder_id:1,
      };
      return supertest(app)
        .post('/api/notes')
        .send(newnote)
        
        .expect(201)
        .expect(res => {
          expect(res.body.note_name).to.eql(newnote.note_name);
          expect(res.body.description).to.eql(newnote.description);
          expect(res.body.folder_id).to.eql(newnote.folder_id);
         
          expect(res.body).to.have.property('id');
        })
        .then(res =>
          supertest(app)
            .get(`/api/notes/${res.body.id}`)
            
            .expect(res.body)
        );
    });

    it('removes XSS attack content from response', () => {
      const { maliciousnote, expectednote } = makeMaliciousnote();
      return supertest(app)
        .post('/api/notes')
        .send(maliciousnote)
        
        .expect(201)
        .expect(res => {
          expect(res.body.note_name).to.eql(expectednote.note_name);
          
        });
    });
  });


});




    
  

  