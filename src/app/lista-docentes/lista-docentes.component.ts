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

@Component({
  selector: 'app-lista-docentes',
  templateUrl: './lista-docentes.component.html',
  styleUrls: ['./lista-docentes.component.css']
})
export class ListaDocentesComponent implements OnInit {
  persona: Persona = new Persona();
  personasTipo2: Persona[] = [];
  personasTipo2b: Persona = new Persona();
  listapersonavalida: Persona[] = [];
  datos: string = "";
  buscar: boolean = true;
  normal: boolean = false;

  constructor(private router: Router, private router1: Router, private notificacionesService: NotificacionesService, private usuarioService: RegistroUsuarioService) { }

  ngOnInit(): void {
    this.usuarioService.obtenerUsuarios().subscribe(
      personas => (this.validarDocente(personas))
    );

    this.buscar = false;
    this.normal = true;
    let usuarioJSON = localStorage.getItem('persona') + "";
    this.persona = JSON.parse(usuarioJSON);


  }

  validarDocente(personas: Persona[]) {
    for (let index = 0; index < personas.length; index++) {
      if (personas[index].tipo == 2) {
        this.personasTipo2 = personas.filter(persona => persona.tipo === 2);
        console.log(this.personasTipo2)
      }

    }

  }




  onKeydownEvent(event: KeyboardEvent, cedula: String): void {
    this.normal = false;
    if (cedula == "") {
      this.ngOnInit();
    } else if (cedula.length == 10) {
      this.usuarioService.obtenerCedula(cedula + "").subscribe(
        response => (
         this.validDocenteBuscar(response)
        ), (error) => (
          Swal.fire({
            title: '<strong>Docente no encontrada</strong>',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#012844',
            icon: 'error',
          })
        )
      )
    }
  }

  validDocenteBuscar(persona: Persona) {
    if (persona.tipo == 2) {
      this.personasTipo2b =persona;
      this.buscar = true;
    }else{
      Swal.fire({
        title: '<strong>No encontrado</strong>',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#012844',
        icon: 'error',
      })
    }
  }


  Editar(persona: Persona) {
    if (persona.activo === true) {
      persona.activo = false;
      this.usuarioService.updatePersona(persona).subscribe(
        response => {
          Swal.fire({
            confirmButtonColor: '#012844',
            icon: 'success',
            title: 'Actualizado',
            text: '¡Se ha cambiado el estado ha no disponible!'

          })
        }
      )
    } else if (persona.activo === false) {
      persona.activo = true;
      this.usuarioService.updatePersona(persona).subscribe(
        response => {
          Swal.fire({
            confirmButtonColor: '#012844',
            icon: 'success',
            title: 'Actualizado',
            text: '¡Se ha cambiado el estado ha disponible!'

          })
        }
      )
    }

  }




}



