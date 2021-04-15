let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

chai.use(chaiHttp);


describe('/GET users', () => {

    let token = "";
    let email = "test@gmail.com";
    let password = "testTask@231";
    let newUserId;
    let userToken = "";
    let taskName = "TASK #1234-673";
    let taskDesc = "Created for testing the Task API";
    let taskId;

    //SignIn before testing other REST API's
    before(function(done) {
        chai.request(server)
          .post('/api/V1/signIn')
          .send({
            "email" : "dinesh@gmail.com",
            "password" : "test@123"
        })
          .end(function(err, res) {
            var result = JSON.parse(res.text);
            token = result.data.token;
            done();
          });
      });

    it('it should GET all the Users', (done) => {
      chai.request(server)
          .get('/api/V1/users?limit=10&page=0')
          .set('Authorization', 'Bearer ' + token)
          .end((err, res) => {
                chai.expect(res.body.data.length).to.be.above(0);
                chai.expect(res).to.have.status(200);
                done();
          });
    });

    it('it should create the user', (done) => {
        chai.request(server)
            .post('/api/V1/user')
            .send({
                "name" : "Shiva",
                "email" : email,
                "password" : password,
                "dob" : "24-11-1994",
                "address" : "porur",
                "role" : "USER"
            })
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                newUserId = res.body.data["_id"];
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.message).to.equals("User created successfully");
                done();
            });
      });

      it('it should user by ID', (done) => {
        chai.request(server)
            .get('/api/V1/user/'+newUserId)
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.message).to.equals("User details fetched successfully");
                chai.expect(res.body.data[0].email).to.equals(email);
                done();
            });
      });

      it('It should able to login User account', (done) => {
        chai.request(server)
            .post('/api/V1/signIn')
            .send({
                "email" : email,
                "password" : password
            })
            .set('Authorization', 'Bearer ' + token)
            .end((err, res) => {
                var result = JSON.parse(res.text);
                userToken = result.data.token;
                chai.expect(res.body.data.user.name).to.equals("Shiva");
                done();
            });
      });

      it('it should create task', (done) => {
        chai.request(server)
            .post('/api/V1/todoTask')
            .send({
                "name" : taskName,
                "description" : taskDesc,
                "startDate" : "04-04-2021",
                "duration" :  "1 hour",
                "userId" : newUserId
            })
            .set('Authorization', 'Bearer ' + userToken)
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.message).to.equals("Task has created successfully");
                taskId = res.body.data._id;
                done();
            });
      });

      it('it should fetch all tasks', (done) => {
        chai.request(server)
            .get('/api/V1/todoTasks')
            .query({userId: newUserId})
            .set('Authorization', 'Bearer ' + userToken)
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body.message).to.equals("Task list fetched successfully");
                chai.expect(res.body.data.length).to.be.above(0);
                done();
            });
      });

      it('it should update task by ID', (done) => {
        chai.request(server)
            .put('/api/V1/todoTask')
            .query({ "id" : taskId,})
            .send({
                "endDate" : "10-04-2021",
                "duration" :  "2 hour",
            })
            .set('Authorization', 'Bearer ' + userToken)
            .end((err, res) => {
                chai.expect(res.body.message).to.equals("Task has updated successfully");
                chai.expect(res).to.have.status(200);
                done();
            });
      });

      after(function(done) {
        chai.request(server)
          .delete('/api/V1/user/'+newUserId)
          .set('Authorization', 'Bearer ' + token)
          .end(function(err, res) {
            chai.expect(res).to.have.status(200);
            done();
          });
      });

      after(function(done) {
          chai.request(server)
          .delete('/api/V1/todoTask')
          .query({ "id" : taskId,})
          .set('Authorization', 'Bearer ' + token)
          .end(function(err, res) {
            chai.expect(res).to.have.status(200);
            done();
          });
      });

});