import { Component, OnInit, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Libro } from '../models/Libro';
import { Bibliotecario } from '../models/Bibliotecario_Cargo';
import { FormBuilder, FormGroup, NgForm, Validators, FormControl, NgModel, AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { ListasService } from '../services/listas.service';
import { Tipo } from '../models/Tipo';
import { Autor } from '../models/Autor';
import { RegistroBibliotecarioService } from '../services/registro-bibliotecario.service';
import { Persona } from '../models/Persona';
import Swal from 'sweetalert2';
import { registerLocaleData } from '@angular/common';
import { Observable, catchError, map, startWith, throwError, filter, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActaDonacionService } from '../services/acta-donacion.service';
import { LibroService } from '../services/libro.service';
import { PersonaService } from '../services/persona.service';
import { Autor_Libro } from '../models/Autor_Libro';
import { Etiqueta } from '../models/Etiqueta';
import { Donante } from '../models/Donante';


// Función de validación personalizada para el autocompletar



@Component({
  selector: 'app-vista-registro-new',
  templateUrl: './vista-registro-new.component.html',
  styleUrls: ['./vista-registro-new.component.css']
})
export class VistaRegistroNewComponent implements OnInit {
  etiquetas: Etiqueta = new Etiqueta;
  bibliotecarios: Bibliotecario = {};
  tipo: Tipo = new Tipo;
  tipo1: Tipo = new Tipo;
  autor: Autor = new Autor
  autor1: Autor = new Autor
  donante:Donante=new Donante;
  autorlibro: Autor_Libro = new Autor_Libro
  imagen?: File;
  reporteV: String = "";
  reporteV2: String = "";
  bibliotecarioE: Bibliotecario = {};
  persona: Persona = {};
  Tipoe: Tipo[] = []
  guardar: boolean = true;
  cedulabiblio?: String = "";
  nombrebiblio?: String = ''
  displayPopup: boolean = false;

  opcionSeleccionado: string = '0';
  idlibro?: number = 0;
  titulolibro?: string

  idb?: number;
  nombreT: string = '';


  libros: Libro[] = [];
  lib: Libro = new Libro;
  bus: boolean = true;
  buscarval: boolean = false;




  public keyword = 'nombre';
  constructor(
    private sanitizer: DomSanitizer,
    private libroservice: LibroService,
    private rutas: Router,
    private bibliotecarioservice: RegistroBibliotecarioService,
    private ListaT: ListasService,
    private ActaDonacionService: ActaDonacionService,
    private personaservice: PersonaService,
    private formBuilder: FormBuilder,
    private router: Router,
    private listasService: ListasService,

  ) {
  }

  ngOnInit(): void {
    this.reporteV = localStorage.getItem('bibliotecario') + "";
    this.reporteV2 = localStorage.getItem('nombrebibliotecario') + "";
    this.librosF.controls['disponibilidad'].setValue('0');

    this.obtenerAutor()
    this.obtenerDonante()
    this.ObtenerTipo()
    this.buscar()



  }


  step = 1;
  totalSteps = 4;
  avanzar1() {
    if (this.step < this.totalSteps) {
      this.step++;
    }
  }
  retroceder1() {
    if (this.step > 1) {
      this.step--;
    }
  }

  displayStyle = "none";

  openPopup() {
    this.displayStyle = "block";
  }
  closePopup() {
    this.displayStyle = "none";
  }



  public previsualizacion?: string
  public PDF?: string
  public archivos: any = []


  //validacion de autor
  public validarAutorSeleccionado: ValidatorFn = (form: AbstractControl) => {
    const autorSeleccionado = String(form.value);
    // Si el valor del autor seleccionado es null, undefined o una cadena vacía, retorna un objeto con el error
    if (!autorSeleccionado || autorSeleccionado.trim() === '') {
      return { autorNoSeleccionado: true };
    }
    // Si el valor no está vacío, retorna null (sin error)
    return null;
  };


  // Validador personalizado para asegurar que no se seleccione "Seleccione"
  seleccionOpcion = (control: AbstractControl) => {
    const seleccion = control.value;
    if (seleccion === '0') {
      return { seleccionOpcionInvalida: true };
    }
    return null;
  };



  

  //Metodo para validar Tipo
  validarTipoLibroSeleccionado = (control: AbstractControl): ValidationErrors | null => {
    const tipoLibroSeleccionado = String(control.value); // Convertir a cadena

    // Si el valor del tipo de libro seleccionado es null, undefined o una cadena vacía, retorna un objeto con el error
    if (!tipoLibroSeleccionado || tipoLibroSeleccionado.trim() === '') {
      return { tipoLibroVacio: true };
    }

    // Si el valor no está vacío, retorna null (sin error)
    return null;
  };
  // FIN VALIDAR TIPOS


  //VALIDAR TODOS LOS CAMPOS LLENOS
  todosCamposLlenos(): boolean {
    const camposRequeridos = [
      'codigoDewey', 'titulo', 'subtitulo', 'tipo', 'adquisicion', 'anioPublicacion',
      'editor', 'ciudad', 'numPaginas', 'area', 'conIsbn', 'idioma', 'descripcion',
      'indiceUno', 'indiceDos', 'indiceTres', 'dimenciones', 'estadoLibro', 'disponibilidad',
      'donante', 'autor', 'donante1', 'tipo1'
    ];

    return camposRequeridos.every(campo => !this.librosF.get(campo)?.invalid);
  }

  //FIN VALIDAR TOSO LOS CAMPOS LLENOS

  //VALIDAR NUMERO NEGATIVO

  validarNumeroNoNegativo(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (valor < 0) {
      return { numeroNegativo: true };
    }
    return null;
  }

  //FIN VALIDAR NUMERO NEGATIVO

  // Trabajar con Reactive Froms
  public librosF: FormGroup = new FormGroup({
    codigoDewey: new FormControl("", [Validators.required]),
    titulo: new FormControl("", [Validators.required]),
    subtitulo: new FormControl("", [Validators.required]),
    tipo: new FormControl(
      {
        id: new FormControl(""),
        nombre: new FormControl(""),
        activo: new FormControl("")
      },
    ),
    adquisicion: new FormControl("", [Validators.required]),
    anioPublicacion: new FormControl("", [Validators.required, Validators.max(9999), this.validarNumeroNoNegativo]),
    editor: new FormControl("", [Validators.required]),
    ciudad: new FormControl("", [Validators.required, Validators.pattern('^[a-zA-Z ]{1,15}$')]),
    numPaginas: new FormControl("", [Validators.required, this.validarNumeroNoNegativo]),
    area: new FormControl("", [Validators.required]),
    conIsbn: new FormControl("", [Validators.required, Validators.pattern(/^[A-Za-z\s]{1,15}$/)]),
    idioma: new FormControl("", [Validators.required, Validators.pattern("[a-zA-ZÀ-ÿ\s,.;'-]+")]),
    descripcion: new FormControl("", [Validators.required]),
    indiceUno: new FormControl("", [Validators.required]),
    indiceDos: new FormControl("",),
    indiceTres: new FormControl("",),
    dimenciones: new FormControl("", [Validators.required, Validators.pattern('[0-9]{2,3}x[0-9]{2,3}')]),
    estadoLibro: new FormControl("", [Validators.required, this.seleccionOpcionInvalida]),
    urlImagen: new FormControl(""),
    activo: new FormControl("true"),
    urlDigital: new FormControl("", [Validators.required, Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w .-]*)*\/?$/i)]),
    fechaCreacion: new FormControl(new Date),
    persona: new FormControl(
      {
        id: new FormControl(""),
        activo: new FormControl(""),
        cedula: new FormControl(""),
        celular: new FormControl(""),
        correo: new FormControl(""),
        nombres: new FormControl(""),
        apellidos: new FormControl(""),
        direccion: new FormControl(""),
        calificacion: new FormControl(""),
        tipo: new FormControl(""),
        password: new FormControl(""),
        fenixId: new FormControl(""),
        authStatus: new FormControl("")
      }
    ),
    disponibilidad: new FormControl("", [this.seleccionOpcion]),
    donante: new FormControl({
      id: new FormControl(""),
      nombre: new FormControl("")
    },),
    urlActaDonacion: new FormControl(''),
    autor: new FormControl('', [this.validarAutorSeleccionado, Validators.required]),
    donante1: new FormControl('', [Validators.required, this.validarAutorSeleccionado]),
    tipo1: new FormControl('', [Validators.required, this.validarTipoLibroSeleccionado])
  });








  // fin de Reactive Forms

  //VALIDACIONES
  get dimenciones() {
    return this.librosF.get('dimenciones');
  }

  get idiomaControl() {
    return this.librosF.get('idioma');
  }
  get anioPublicacionControl() {
    return this.librosF.get('anioPublicacion');
  }

  get urlDigitalControl() {
    return this.librosF.get('urlDigital');
  }

  get ciudadControl() {
    return this.librosF.get('ciudad');
  }
  get codigoDeweyControl() {
    return this.librosF.get('codigoDewey');
  }

  get conIsbnControl() {
    return this.librosF.get('conIsbn');
  }
  get tituloControl() {
    return this.librosF.get('titulo');
  }
  get subtituloControl() {
    return this.librosF.get('subtitulo');
  }
  get indiceUnoControl() {
    return this.librosF.get('indiceUno');
  }
  get indiceDosControl() {
    return this.librosF.get('indiceDos');
  }

  get indiceTresControl() {
    return this.librosF.get('indiceTres');
  }
  get adquisicionControl() {
    return this.librosF.get('adquisicion');
  }
  get descripcionControl() {
    return this.librosF.get('descripcion');
  }
  get numPaginasControl() {
    return this.librosF.get('numPaginas');
  }
  get estadoLibroControl() {
    return this.librosF.get('estadoLibro');
  }

  get editorControl() {
    return this.librosF.get('editor');
  }
  get areaControl() {
    return this.librosF.get('area');
  }


  get DisponibeControl() {
    return this.librosF.get('disponibilidad');
  }






  // Validador personalizado
  seleccionOpcionInvalida(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;
    if (valor === '1' || valor === '2' || valor === '3') {
      return null; // Opción válida, no hay error
    } else {
      return { seleccionOpcionInvalida: true }; // Opción inválida, retorna el error
    }
  }

  validarSeleccion = (control: FormControl) => {
    const seleccion = control.value;
    if (seleccion === '0') {
      return { seleccionInvalida: true };
    }
    return null;
  };
  //FIN VALIDACIONES
  public dato!: Observable<any['']>;


  obtenerAutor(): void {
    this.dato = this.ListaT.obtenerAutores();
  }

  //ESTO ES PARA CAPTURAR EL AUTOR

  selectedAutor: any;

  capturarAutor(posicion: any) {

    if (posicion && posicion.nombre) {
      this.autor = posicion;

      this.autorlibro.autor = this.autor

    }

  }

  AbrirAutor() {
    var overlay = document.getElementById('overlay99');
    overlay?.classList.add('active');

  }

  cerrarpopup() {
    var overlay = document.getElementById('overlay99');
    overlay?.classList.remove('active');
  }

  AbrirTipo() {
    var overlay = document.getElementById('overlay96');
    overlay?.classList.add('active');

  }

  cerrarpopup2() {
    var overlay = document.getElementById('overlay96');
    overlay?.classList.remove('active');
  }

  AbrirDonante() {
    var overlay = document.getElementById('overlay91');
    overlay?.classList.add('active');

  }

  cerrarpopup3() {
    var overlay = document.getElementById('overlay91');
    overlay?.classList.remove('active');
  }
  //FIN CAPTURAR AUTOR

  // ESTO ES PARA CAPTURAR EL DONANTE
  public dato1!: Observable<any['']>;
  obtenerDonante(): void {
    this.dato1 = this.ListaT.listarDonate();


  }

  selectedDonante: any

  capturarDonante(e: any) {

    this.selectedDonante = e

    if (this.selectedDonante && this.selectedDonante.nombre) {
      this.librosF.get('donante')?.patchValue(this.selectedDonante); // Establecer el valor en el formulario
    }
  }


  // FIN CAPTURAR EL DONANTE

  //Conseguir capturar tipo de Libro

  public dato2!: Observable<any['']>;

  ObtenerTipo() {
    this.dato2 = this.ListaT.obtenerTipos();
  }

  selectTipo: any

  seleccionT(e: any) {
 

    this.selectTipo = e

    if (this.selectTipo && this.selectTipo.nombre) {
      this.librosF.get('tipo')?.patchValue(this.selectTipo);
    }


  }


  OnImprimir(tit: NgModel, publi: NgModel, pag: NgModel, des: NgModel, est: NgModel, edi: NgModel, area: NgModel) {
    const encabezado = ["Titulo", "N° Pag", "Descripcion", "Editor", "Publcacion", "Tipo", "Estado"]

   

    const cuerpo = [
      tit.value,
      pag.value,
      des.value,
      edi.value,
      publi.value,
      area.value,
      est.value
    ]



    this.ActaDonacionService.imprimir(encabezado, cuerpo, "Acta de Donacion", false)
  }





  onKeydownEvent(event: KeyboardEvent, titulo: String): void {
    if (titulo == "") {
      this.ngOnInit();
    }
  }

  buscarLibxNomb(nombre: String) {
    this.libroservice.buscarLibro(nombre).subscribe(
      data => {
        this.libros = data;
      }
    )
  }




  //FIN DE CAPTURAR AUTOR







  capturarArchivo(event: any): any {
    const archivocapturado = event.target.files[0]
    this.extraerBase64(archivocapturado).then((image: any) => {

  
    })


  }

  capturarImagen(event: any): any {
    const archivocapturado = event.target.files[0]
    this.imagen = event.target.files[0]
    this.extraerBase64(archivocapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
    })

  }





  //Extraer para visualizacion
  extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
    try {
      const unsafeImg = window.URL.createObjectURL($event);
      const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
      const reader = new FileReader();
      reader.readAsDataURL($event);
      reader.onload = () => {
        resolve({
          base: reader.result

        });
      };
      reader.onerror = error => {
        resolve({
          base: null
        });
      };

    } catch (e) {
      console.log("Error al Subir Imagen")
    }
  })
  //Fin de capturar archivos


  //Capturar Persona
  buscar() {

    this.persona = JSON.parse(localStorage.getItem('persona') + "");
    this.cedulabiblio = this.persona.cedula
    this.personaservice.buscarxcedula(this.cedulabiblio + '').subscribe(
      data => {
        const datospersona = {
          id: data.id,
          activo: data.activo,
          cedula: data.cedula,
          celular: data.celular,
          correo: data.correo,
          nombres: data.nombres,
          apellidos: data.apellidos,
          direccion: data.direccion,
          calificacion: data.calificacion,
          tipo: data.tipo,
          password: data.password,
          fenixId: data.fenixId,
          authStatus: data.authStatus
        }
        this.librosF.get('persona')?.patchValue(datospersona)
        this.nombrebiblio = data.nombres + ' ' + data.apellidos

      }
    )

  }





  //Guardar Libro


  public libro: Libro = new Libro();



  public crearLibro(): void {


   
    this.librosF.get('activo')?.setValue(true);
    const librosFCopy = JSON.parse(JSON.stringify(this.librosF.getRawValue()));

    this.libroservice.create(librosFCopy).subscribe(
      (Response: Libro) => {
        this.libro
        this.idlibro = Response.id;
        this.titulolibro = Response.titulo;

        this.autorlibro.libro = Response;


        if (this.titulolibro) {
          localStorage.setItem('titulolibro', this.titulolibro);
        }

        this.ListaT.createAutorLibro(this.autorlibro).subscribe(
          (response: Autor_Libro) => {
            
          }
        );

        if (this.idlibro) {
          const exlibro = this.idlibro.toString();
          window.localStorage.setItem('idlibro', exlibro);
          if (this.imagen) {


            this.libroservice.subirImagen(this.idlibro, this.imagen).subscribe(
              (response: any) => {
                

                Swal.fire({
                  position: 'center',
                  icon: 'success',
                  title: '<strong>Has registrado un Libro</strong>',
                  showConfirmButton: false,
                  timer: 1500
                });

                setTimeout(() => {
                  this.router.navigate(['app-registro-etiquetas']);
                  // location.reload();
                }, 1000);
              },
              (error: any) => {
                console.error('Error al subir la imagen:', error);
                // Maneja el error de acuerdo a tus necesidades
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: '<strong>Has registrado un Libro (sin imagen)</strong>',
              showConfirmButton: false,
              timer: 1500
            });

            setTimeout(() => {
              this.router.navigate(['app-reg-etiquetas']);
              // location.reload();
            }, 1000);
              }
            );

          } else {
            console.warn('No se ha seleccionado ningún archivo.');

            // Mostrar mensaje de guardado sin imagen
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: '<strong>Has registrado un Libro (sin imagen)</strong>',
              showConfirmButton: false,
              timer: 1500
            });

            setTimeout(() => {
              this.router.navigate(['app-reg-etiquetas']);
              // location.reload();
            }, 1000);
          }

        } else {
          console.warn('El ID del libro es undefined.');
        }




      }
    );

  }


  guardarA(autor1: Autor) {
    this.listasService.createAutor(autor1).subscribe(
      response => {
        this.obtenerAutor();
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '<strong>Guardado correctamente</strong>',
          showConfirmButton: false,
          timer: 1500
        })
        var overlay = document.getElementById('overlay99');
        overlay?.classList.remove('active');
      }
    );
  }

  guardarT(tipo1: Tipo) {
    tipo1.activo=true;
    this.listasService.createTipo(tipo1).subscribe(
      response=>{
        this.ObtenerTipo()
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '<strong>Guardado correctamente</strong>',
          showConfirmButton: false,
          timer: 1500
        })
        var overlay = document.getElementById('overlay96');
        overlay?.classList.remove('active');
      }
    );
  }

  guardarD() {
    this.listasService.createDonante(this.donante).subscribe(
      response => {
        this.obtenerDonante()
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '<strong>Guardado correctamente</strong>',
          showConfirmButton: false,
          timer: 1500
        })
        this.cerrarpopup3();
        this.donante=new Donante();
      }
    );
  }
}
