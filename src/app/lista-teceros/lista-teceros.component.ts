
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Libro } from '../models/Libro';
import { Persona } from '../models/Persona';
import { Prestamo } from '../models/Prestamo';
import { LibroService } from '../services/libro.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { RegistroUsuarioService } from '../services/registro-usuario.service';
import { setDate } from 'date-fns';
import { terceroService } from '../services/tercero.service';
import { Tercero } from '../models/Tercero';

@Component({
  selector: 'app-lista-teceros',
  templateUrl: './lista-teceros.component.html',
  styleUrls: ['./lista-teceros.component.css']
})
export class ListaTecerosComponent implements OnInit {
  persona: Persona = new Persona();
  personasTipo2: Tercero[] = [];
  personasTipo2b: Tercero = new Tercero();
  terceroEdit: Tercero = new Tercero();
  listapersonavalida: Persona[] = [];
  datos: string = "";
  buscar: boolean = true;
  normal: boolean = false;

  constructor(private usuarioService: RegistroUsuarioService, private terceroservice: terceroService) { }

  ngOnInit(): void {


    this.terceroservice.obtenerTerceros().subscribe(
      response => (this.personasTipo2 = response)
    );


    this.buscar = false;
    this.normal = true;
    let usuarioJSON = localStorage.getItem('persona') + "";
    this.persona = JSON.parse(usuarioJSON);


  }

  validarDocente(personas: Persona[]) {
    console.log(personas.length)
    for (let index = 0; index < personas.length; index++) {
      if (personas[index].tipo == 2) {
        this.personasTipo2 = personas.filter(persona => persona.tipo === 2);
        console.log(this.personasTipo2)
      }

    }

  }




  onKeydownEvent(event: KeyboardEvent, cedula: String): void {
    if (cedula == "") {
      this.ngOnInit();
    } else {
      if (cedula.length == 10) {
        this.normal = false;
        this.terceroservice.terceroxcedula(cedula + "").subscribe(
          response => (
            console.log(response), this.personasTipo2b = response,
            this.buscar = true
          ), (error) => (
            Swal.fire({
              title: '<strong>Persona no encontrada</strong>',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#012844',
              icon: 'error',
            }),
            this.ngOnInit()
          )
        )
      }
    }
  }

  AbrirEditar(edi: Tercero) {
    var overlay = document.getElementById('overlay96');
    overlay?.classList.add('active');
    this.terceroEdit = edi;

  }

  cerrarpopup2() {
    this.terceroEdit = new Tercero;
    var overlay = document.getElementById('overlay96');
    overlay?.classList.remove('active');
  }


  Editar(persona: Persona) {
    this.terceroservice.updateTercero(persona).subscribe(
      response => {
        Swal.fire({
          confirmButtonColor: '#012844',
          icon: 'success',
          title: 'Actualizado',

        })
      }
    )
    this.cerrarpopup2();
  }




}



