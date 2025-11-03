const request = require("supertest");

const app = require("./server");

describe("GET /", () => {
  it("deve retornar status 200 e a mensagem correta", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toEqual(200);

    expect(res.body.message).toEqual("Pipeline N3 com Testes e Deploy!");
    expect(res.body.versao).toEqual("1.1.0");
  });
});

describe("GET /users", () => {
  it("deve retornar status 200 e uma lista de usuários", async () => {
    const res = await request(app).get("/users");

    expect(res.statusCode).toEqual(200);

    expect(Array.isArray(res.body)).toBe(true);

    expect(res.body[0].nome).toEqual("Alice");
  });

  it("deve retornar o usuário com ID 1", async () => {
    const res = await request(app).get("/users/1");

    expect(res.statusCode).toEqual(200);
    expect(res.body.nome).toEqual("Alice");
  });

  it("deve retornar status 404 para um usuário inexistente", async () => {
    const res = await request(app).get("/users/99");

    expect(res.statusCode).toEqual(404);
    expect(res.body.error).toEqual("Usuário não encontrado");
  });
});

afterAll((done) => {
  app.close(done);
});
