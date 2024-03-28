import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Donante } from 'src/app/models/Donante';
import { Etiqueta } from 'src/app/models/Etiqueta';
import { Tipo } from 'src/app/models/Tipo';
import { ListasService } from 'src/app/services/listas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-donante',
  templateUrl: './lista-donante.component.html',
  styleUrls: ['./lista-donante.component.css']
})
export class ListaDonanteComponent implements OnInit {

  Etiquetas: Etiqueta[] = []
  Donantes: Donante[] = [];
  buscarD?: boolean;
  etiquetaEdit: Etiqueta = new Etiqueta();
  buscarE?: boolean;
  donanteEdit: Donante = new Donante()
  estado: string = "";


  constructor(private listaservice: ListasService, private router: Router) { }

  ngOnInit(): void {
    this.buscarD = false;
    this.buscarE = false;
    this.listaservice.listarDonate().subscribe(
      Donantes => this.Donantes = Donantes
    );

    this.listaservice.obteneEtiquetas().subscribe(
      Etiquetas => this.Etiquetas = Etiquetas
    );
  }
  registroDonante() {
    this.router.navigate(['/app-registro-donante']);
  }

  registroetiqueta() {
    this.router.navigate(['/app-registro-etiquetas']);
  }

  onKeydownEvent(event: KeyboardEvent, buscar2: string): void {
    if (buscar2 == "") {
      this.ngOnInit();
    } 
  }
  onKeydownEvent2(event: KeyboardEvent, buscar3: string): void {
    if (buscar3 == "") {
      this.ngOnInit();
    }
  }

  buscarDonante(buscar2: string) {
    this.listaservice.listarxnombre(buscar2).subscribe(
      response => {
        if (response === null) {
          Swal.fire({
            title: '<strong>Donante no encontrado</strong>',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#012844',
            icon: 'error',
          })
          this.ngOnInit();
        } else {
          this.Donantes = response;
          this.buscarD = true;
        }
      }
    );
  }

  buscarEtiqueta(buscar3: string) {
    this.Etiquetas=[];
    this.listaservice.buscarEtiquetaxnombre(buscar3).subscribe(
      response => (
        this.Etiquetas = response,
        this.buscarE = true
       ), (error) => (
         Swal.fire({
           title: '<strong>Etiqueta no encontrada</strong>',
           confirmButtonText: 'Aceptar',
           confirmButtonColor: '#012844',
           icon: 'error',
         }),
         this.ngOnInit()
       ))
   
  }
  validar(){
   
  }


  AbrirDonante(donante: Donante) {
    var overlay = document.getElementById('overlay97');
    overlay?.classList.add('active');
    this.donanteEdit = donante;
  }

  AbrirEtiqueta(etiqueta: Etiqueta) {
    var overlay = document.getElementById('overlay96');
    overlay?.classList.add('active');
    this.etiquetaEdit = etiqueta;
    this.estado = this.getNombreEstado(this.etiquetaEdit.activo);

  }
  cerrarpopup3() {
    this.donanteEdit = new Donante;
    var overlay = document.getElementById('overlay97');
    overlay?.classList.remove('active');
  }

  EditarDonante(donante: Donante) {
    if (donante.id != undefined) {
      this.listaservice.editarDonante(donante.id, donante).subscribe(
        response => {
          console.log(response)
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: '<strong>Modificado correctamente</strong>',
            showConfirmButton: false,
            timer: 1500
          })
          var overlay = document.getElementById('overlay96');
          overlay?.classList.remove('active');
        }
      );
      setTimeout(() => {
        this.obtenerDonantes();
        this.cerrarpopup3()
      }, 1000);

    }
  }

  obtenerEtiqueta() {
    this.listaservice.obteneEtiquetas().subscribe(
      Etiquetas => this.Etiquetas = Etiquetas
    );
  }

  obtenerDonantes() {
    this.listaservice.listarDonate().subscribe(
      Donantes => this.Donantes = Donantes
    );
  }

  getNombreEstado(estado: boolean | undefined): string {
    let nombreEstado = 'Desconocido'; // Valor predeterminado si el número del estado es undefined

    if (estado !== undefined) {
      if (estado == true) {
        nombreEstado = "Activo";
      } else {
        nombreEstado = "Inactivo"
      }
    }

    return nombreEstado;
  }

  EditarEtiqueta(etiqueta: Etiqueta) {
    if (etiqueta.id != undefined) {
      this.listaservice.editarEtiqueta(etiqueta.id, etiqueta).subscribe(
        response => {
          console.log(response)
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: '<strong>Modificado correctamente</strong>',
            showConfirmButton: false,
            timer: 1500
          })
          var overlay = document.getElementById('overlay96');
          overlay?.classList.remove('active');
        }
      );
      setTimeout(() => {
        this.obtenerEtiqueta();
        this.cerrarpopup2();
      }, 1000);

    }
  }
  cerrarpopup2() {
    this.etiquetaEdit = new Etiqueta;
    this.estado = "";
    var overlay = document.getElementById('overlay96');
    overlay?.classList.remove('active');
  }

}
