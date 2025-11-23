/// <reference types="cypress" />

describe('Probando el login de admin',() =>{
    it('Probando el flujo completo', () =>{
        // ruta inicial
        cy.visit('localhost:5173');
        // botón para ir al login desde la página inicial
        cy.get('#loginBtn').click();
        // ruta después de darle al botón, esto es solo un check
        cy.url().should('include', '/login');
        //el campo del correo
        cy.get('#email').type('practicasprofecionalespascuali@gmail.com');
        //el campo de la contraseña
        cy.get('#password').type('Admin2025!');
        //el botón para iniciar sesión
        cy.get('#entrarLoginBtn').click();
        // otro check de las rutas
        cy.url().should('include', '/panel/admin');
        //el botón para entrar a la lista de empresas
        cy.get('#IrAlPanelEmpresas').click();
        // último check de la ruta, para ver que esté en el panel de gestión de empresas
        cy.url().should('include', '/panel/admin/empresas');
        //ruta del botón para aprobar una empresa
        cy.get('#AprobarEmpresaAdmin').click();
        //fin del test
    });
   
});


