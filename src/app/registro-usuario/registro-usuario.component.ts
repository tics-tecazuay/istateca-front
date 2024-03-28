import { Component, OnInit } from '@angular/core';
import { RegistroUsuarioService } from '../services/registro-usuario.service';
import { Router } from '@angular/router';
import { Usuario } from '../models/Usuario';
import { Persona } from '../models/Persona';
import { PersonaP } from '../models/PersonaP';
import { PersonaService } from '../services/persona.service';
import { ErrorHandler } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-editUsuario',
  templateUrl: './registro-usuario.component.html',
  styleUrls: ['./registro-usuario.component.css']
})
export class RegistroUsuarioComponent implements OnInit {
  reporteV: String = "";
  public usuario: Usuario = new Usuario();
  persona: Persona = {};
  persona2: Persona = {};
  personaP: PersonaP = {};
  usuarioE: Usuario = {};
  id?: number;



  constructor(private usuarioservice: RegistroUsuarioService, private router: Router, private personaServices: PersonaService) { }

  ngOnInit(): void {


    var personaJSONGET = localStorage.getItem("persona");
    this.persona = JSON.parse(personaJSONGET + "");

  }

  contieneSoloNumeros(texto: string): boolean {
    return /^[0-9]+$/.test(texto);
  }




  actualizarUsuario(persona: Persona) {
    if (this.contieneSoloNumeros(persona.celular + "")) {
      if(persona.celular?.length==10){
      Swal.fire({
        title: '¿Quieres guardar los cambios?',
        text: "¡No puede revertir los datos!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#012844',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33',
        confirmButtonText: '¡Si, modificalo!'
      }).then((result) => {
        if (result.isConfirmed) {


          this.personaServices.updatePersona(persona)
            .subscribe(data => {
              this.persona = data
            })
          Swal.fire({
            title: '<strong>¡Usuario Actualizado!</strong>',
            confirmButtonText: 'OK',
            confirmButtonColor: '#012844',
            icon: 'success',
            html:

              'El usuario<br><b>' + this.persona.nombres + ' ' + this.persona.apellidos + '</b><br>' +
              'ha sido actualizado correctamente'

          }

          )
          this.ngOnInit();
          this.router.navigate(['/'])
        }
      })
      }else{
        Swal.fire({
          confirmButtonColor: '#012844',
          icon: 'error',
          title: 'El teléfono no contiene 10 digitos',
        })
      }
    }else{
      Swal.fire({
        confirmButtonColor: '#012844',
        icon: 'error',
        title: 'El teléfono contiene letras',
      })
    }
  }



  buscar(idss: number) {

    this.id = idss;

    this.usuarioservice.obtenerPersonasId(this.id).subscribe(
      response => {
        this.persona = response
      }
    )
  }

}
