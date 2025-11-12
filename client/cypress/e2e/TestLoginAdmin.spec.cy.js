/// <reference types="cypress" />

describe('Probando el login de admin',() =>{
    it('Probando botones de página inicial', () =>{
        cy.visit('localhost:5173');
        cy.get('loginBtn').rightclick();
    });
    
    it('Probando a insertar credenciales de Admin', ()=>{
        //ruta
        cy.visit('localhost:5173/login');
        //el campo del correo
        cy.get('email').type('practicasprofecionalespascuali@gmail.com');
        //el campo de la contraseña
        cy.get('password').type('Admin2025!');
        //el botón para iniciar sesión
        cy.get('entrarLoginBtn').rightclick();
    })

    it('Probando a activar una cuenta de empresa', () =>{
        //ruta
        cy.visit('localhost:5173/panelAdmin');
    })

});


