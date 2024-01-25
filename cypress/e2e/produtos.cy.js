/// <reference types="cypress" />
import contrato from '../contracts/produtos.contract'

describe('Teste de produtos', () => {
     let token
    beforeEach(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn})
    });

    it('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    })
    
    it('Listar os produtos', () => {
        // Sempre aumentar +1 no produto para localizar corretamente
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            expect(response.body.produtos[21].nome).to.equal('Capa de Celular')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(20)
        })
    });

    it('Cadastrar produto', () => {
        let produto = `Produto de Teste ${Math.floor(Math.random() * 1000000000)}`
        cy.cadastrarProduto(token, produto, 600, 'descrição do produto', 1000)

        .then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    });

    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, 'Produto de Teste v3', 600, 'Descrição do produto', 800)

        .then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal('Já existe produto com esse nome')
        })
    });

    it('Deve editar um produto cadastrado', () => {
        cy.request('produtos').then(response => {
            let id = response.body.produtos[0]._id
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token },
                body:
                {
                    "nome": "Produto editado 12",
                    "preco": 500,
                    "descricao": "Produto editado",
                    "quantidade": 1000
                }
            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto de Teste ${Math.floor(Math.random() * 1000000000)}`
        cy.cadastrarProduto(token, produto, 500, 'produto de teste', 780)
            .then(response => {
                let id = response.body._id

                cy.request({
                    metohd: 'PUT',
                    url: `produtos/${id}`,
                    headers: {authorization: token },
                    body:
                    {
                        "nome": produto,
                        "preco": 200,
                        "descricao": 'produto editado 2',
                        "quantidade": 430
                    }
                })
            })
    })

    it('Deve deletar um produto cadastrado previamente', () => {
        let produto = `Produto de Teste ${Math.floor(Math.random() * 1000000000)}`
        cy.cadastrarProduto(token, produto, 500, 'descricao teste', 100)
        .then(response => {
            let id = response.body._id
            cy.request({
                method: 'DELETE',
                url: `produtos/${id}`,
                headers: {authorization: token}
            }).then(response => {
                expect(response.body.message).to.equal('Registro excluído com sucesso')
                expect(response.status).to.equal(200)
            })
        })
    })
});