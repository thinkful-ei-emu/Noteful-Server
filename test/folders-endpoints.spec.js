const knex=require('knex');
const app =require('../src/app');
const {makeMaliciousFolder,makeFoldersArray}=require('./folders-fixtures');



describe('Folders ENDPOINTS',()=>{
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
  

  before('cleanup',()=>{
    return db.raw('truncate notes,folders RESTART IDENTITY');
  });
  afterEach('cleanup',()=>{
    return db.raw('truncate notes,folders RESTART IDENTITY');
  });

  describe('GET /api/folders', () => {
    context('Given no folders', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, []);
      });
    });
  

    context('Given there are folders in the database', () => {
      const testfolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testfolders);
      });

      it('gets the folders from the store', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testfolders);
      });
    });
  });
  context('Given an XSS attack folder', () => {
    const { maliciousFolder, expectedFolder } =makeMaliciousFolder();

    beforeEach('insert malicious folder', () => {
      return db
        .into('folders')
        .insert([maliciousFolder]);
    });

    it('removes XSS attack content', () => {
      return supertest(app)
        .get('/api/folders')
        .expect(200)
        .expect(res => {
          expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name);
           
        });
    });
  });

  describe('GET /api/folders/:id', () => {
    context('Given no folders', () => {
      it('responds 404 whe folder doesn\'t exist', () => {
        return supertest(app)
          .get('/api/folders/123')
          
          .expect(404, {
            error: { message: 'Folder not Found' }
          });
      });
    });

    context('Given there are folders in the database', () => {
      const testfolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testfolders);
      });

      it('responds with 200 and the specified folder', () => {
        const folderId = 2;
        const expectedfolder = testfolders[folderId - 1];
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          
          .expect(200, expectedfolder);
      });
    });

    context('Given an XSS attack folder', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

      beforeEach('insert malicious folder', () => {
        return db
          .into('folders')
          .insert([maliciousFolder]);
      });

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/folders/${maliciousFolder.id}`)
          
          .expect(200)
          .expect(res => {
            expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
            
          });
      });
    });
  });

  describe('DELETE /api/folders/:id', () => {
    context('Given no folders', () => {
      it('responds 404 whe folder doesn\'t exist', () => {
        return supertest(app)
          .delete('/api/folders/123')
         
          .expect(404, {
            error: { message: 'Folder not Found' }
          });
      });
    });

    context('Given there are folders in the database', () => {
      const testfolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testfolders);
      });

      it('removes the folder by ID from the store', () => {
        const idToRemove = 2;
        const expectedfolders = testfolders.filter(bm => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          
          .expect(204)
          .then(() =>
            supertest(app)
              .get('/api/folders')
              
              .expect(expectedfolders)
          );
      });
    });
  });

  describe('Patch api/folders/:folderid',()=>{
    context('Given no articles',()=>{
      it('responds with a 404',()=>{
        const folderid=300;
        return supertest(app)
          .patch(`/api/folder/${folderid}`)
          
          .expect(404,{});
      });
    });
  });

  context('Given there are folders in the database',()=>{
    const testfolders=makeFoldersArray();

    beforeEach('Insert folders',()=>{
      return db 
        .into('folders')
        .insert(testfolders);
    });
    it('responds with 204 and updates the articles',()=>{
      const idtoUpdate=2;
      const updatefolder=
      {
        folder_name:'blahblahb',
        
      };
      return supertest(app)
        .patch(`/api/folders/${idtoUpdate}`)
        .send(updatefolder)
        .expect(204);
    });
  });

  describe('POST /api/folders', () => {
    it('responds with 400 missing \'folder_name\' if not supplied', () => {
      const newfolderMissingName = {
        // folder_name: 'test-name',
        
      };
      return supertest(app)
        .post('/api/folders')
        .send(newfolderMissingName)
        
        .expect(400, '\'folder_name\'is required');
    });

    it('adds a new folder to the store', () => {
      const newfolder = {
        folder_name:'YAY'
      };
      return supertest(app)
        .post('/api/folders')
        .send(newfolder)
        
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newfolder.folder_name);
         
          expect(res.body).to.have.property('id');
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            
            .expect(res.body)
        );
    });

    it('removes XSS attack content from response', () => {
      const { maliciousFolder, expectedFolder } = makeMaliciousFolder();
      return supertest(app)
        .post('/api/folders')
        .send(maliciousFolder)
        
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(expectedFolder.folder_name);
          
        });
    });
  });


});




    
  

  