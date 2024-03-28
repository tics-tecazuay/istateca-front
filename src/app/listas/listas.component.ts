import { Component, OnInit } from '@angular/core';
import { ListasService } from '../services/listas.service';
import { Autor } from '../models/Autor';
import { Tipo } from '../models/Tipo';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.css']
})
export class ListasComponent implements OnInit {
  Autores:Autor[]=[];
  ttipos:Tipo[]=[];
  buscarA?:boolean;
  buscarT?:boolean;
  tipoEdit:Tipo=new Tipo();
  autorEdit:Autor = new Autor()
  estado:string="";

  constructor(private  listaservice: ListasService, private router: Router) { }

  ngOnInit(): void {
    this.buscarA=false;
    this.buscarT=false;
    
    this.obtenerTipos();
    this.obtenerAutores();
  }
  obtenerTipos(){
    this.listaservice.obtenerTipos().subscribe(
      ttipos=>this.ttipos=ttipos
    );
  }

  obtenerAutores(){
    this.listaservice.obtenerAutores().subscribe(
      Autores=> this.Autores=Autores
    );
  }

  registroAutor(){
    this.router.navigate(['/app-registro-autor']);
  }

  resgistroTipo(){
    this.router.navigate(['/app-registro-tipo']);
  }

  onKeydownEvent(event: KeyboardEvent, buscar2: string): void {
    if (buscar2 == "") {
      this.ngOnInit();
    }

     
    
  }

  buscarAutor(buscar2:string){
    this.listaservice.listarautoresxnombre(buscar2).subscribe(
      response => {
        console.log(response);
        if (response == null) {
          Swal.fire({
            title: '<strong>Autor no encontrado</strong>',
            confirmButtonText: 'error',
            confirmButtonColor: '#012844',
            icon: 'error',
          })
          this.ngOnInit();
        } else {
          this.Autores = response;
          this.buscarA=true;
        }
      }
    );
  }
  buscarTipo(buscar2:string){
    this.listaservice.buscarTiposxnombre(buscar2).subscribe(
      response => (
        this.ttipos = response,
        this.buscarT = true
       ), (error) => (
         Swal.fire({
           title: '<strong>Tipo no encontrada</strong>',
           confirmButtonText: 'Aceptar',
           confirmButtonColor: '#012844',
           icon: 'error',
         }),
         this.ngOnInit()
       )
     )
  }

  getNombreEstado(estado: boolean | undefined): string {
    let nombreEstado = 'Desconocido'; // Valor predeterminado si el número del estado es undefined

    if (estado !== undefined) {
      if (estado == true) {
        nombreEstado = "Activo";
      }else{
        nombreEstado="Inactivo"
      }
    }

    return nombreEstado;
  }

  AbrirTipo(tipo:Tipo) {
    var overlay = document.getElementById('overlay96');
    overlay?.classList.add('active');
    this.tipoEdit=tipo;
    this.estado=this.getNombreEstado(this.tipoEdit.activo);

  }

  AbrirAutor(autor:Autor) {
    var overlay = document.getElementById('overlay97');
    overlay?.classList.add('active');
    this.autorEdit=autor;

  }

  cerrarpopup2() {
    this.tipoEdit=new Tipo;
    this.estado="";
    var overlay = document.getElementById('overlay96');
    overlay?.classList.remove('active');
  }

  cerrarpopup3() {
    this.autorEdit=new Autor;
    var overlay = document.getElementById('overlay97');
    overlay?.classList.remove('active');
  }

  EditarTipo(tipo:Tipo) {
    if(tipo.id !=undefined){
    this.listaservice.editarTipo(tipo.id,tipo).subscribe(
      response=>{
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
      this.obtenerTipos();
      this.cerrarpopup2();
    }, 1000);
    
    }
  }

  EditarAutor(autor:Autor) {
    if(autor.id !=undefined){
    this.listaservice.editarAutor(autor.id,autor).subscribe(
      response=>{
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
      this.obtenerAutores();
      this.cerrarpopup3()
    }, 1000);
    
    }
  }

}
