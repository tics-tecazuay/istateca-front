import { Component } from '@angular/core';
import { Libro } from '../models/Libro';
import { Autor_Libro } from '../models/Autor_Libro';
import { ListasService } from '../services/listas.service';
import { Router } from '@angular/router';
import { Observable, catchError, map, startWith, throwError, filter, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { Autor } from '../models/Autor';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { LibroService } from '../services/libro.service';
import Swal from 'sweetalert2';
import { Persona } from '../models/Persona';

@Component({
  selector: 'app-libro-completo',
  templateUrl: './libro-completo.component.html',
  styleUrls: ['./libro-completo.component.css']
})
export class LibroCompletoComponent {
  libro: Libro = new Libro();
  persona: Persona = new Persona();
  autor: Autor = new Autor;
  autor1: Autor = new Autor;
  public previsualizacion?: string
  autores_libros: Autor_Libro = new Autor_Libro();
  autores_libros1: Autor_Libro = new Autor_Libro();

 

  isTipoDisabled: boolean = true

  private url = environment.rooturl
  urlI?: string;
  imagen?: File;
  step = 1;
  totalSteps = 4;

  disp?: string;
  isDisabled: boolean = true;
  editar2: boolean = false;
  mostrarEst: boolean = false;

  public keyword = 'nombre';

  constructor(private listaservice: ListasService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private ListaT: ListasService,
    private libroservice: LibroService,
  ) { }

  ngOnInit() {
    let usuario1JSON = localStorage.getItem('persona') + "";
    this.persona = JSON.parse(usuario1JSON);
    if (this.persona.tipo == 1) {
      this.mostrarEst=true;
    }else{
      this.mostrarEst=false;
    }

    let usuarioJSON = localStorage.getItem('LibroCompleto') + "";

    if (usuarioJSON) {
      const libroCompleto = JSON.parse(usuarioJSON);

      if (libroCompleto) {
        this.librosF.patchValue(libroCompleto);


      }




    }

    this.libro = JSON.parse(usuarioJSON);
    if (this.libro.disponibilidad == true) {
      this.disp = "Disponible";
    } else {
      this.disp = "No disponible"
    }
    this.urlI = this.url + this.libro.urlImagen
    this.listaservice.obtenerAutor_Libro().subscribe(
      response => {

        if (response != null || response != undefined) {
          response.forEach(element => {
            if (element.libro?.id == this.libro.id) {
              this.autores_libros = element;
            }
          })
        }
      }
    );



    this.obtenerAutor()
    this.obtenerDonante()
    this.ObtenerTipo()
  }

  retroceder1() {
    if (this.step > 1) {
      this.step--;
    }
  }


  avanzar1() {
    if (this.step < this.totalSteps) {
      this.step++;
    }
  }




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
    titulo: new FormControl("",  [Validators.required] ),
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
    indiceUno: new FormControl("", []),
    indiceDos: new FormControl("", []),
    indiceTres: new FormControl("", [Validators.required]),
    dimenciones: new FormControl("", [Validators.required, Validators.pattern('[0-9]{2,3}x[0-9]{2,3}')]),
    estadoLibro: new FormControl("", [ ]),
    urlImagen: new FormControl(""),
    activo: new FormControl("true"),
    urlDigital: new FormControl("", [Validators.required, Validators.pattern(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w .-]*)*\/?$/i)]),
    fechaCreacion: new FormControl(""),
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
    disponibilidad: new FormControl("", ),
    donante: new FormControl({
      id: new FormControl(""),
      nombre: new FormControl("")
    },),
    urlActaDonacion: new FormControl(''),
    autor: new FormControl('', []),
    donante1: new FormControl('', [ ]),
    tipo1: new FormControl('', [ ])
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

  getNombreEstadoLibro2(numeroEstado: number | undefined): string {
    let nombreEstado = 'Desconocido'; // Valor predeterminado si el número del estado es undefined

    if (numeroEstado !== undefined) {
      switch (numeroEstado) {
        case 1:
          nombreEstado = 'Nuevo';
          break;
        case 2:
          nombreEstado = 'Bueno';
          break;
        case 3:
          nombreEstado = 'Regular';
          break;
        case 4:
          nombreEstado = 'Malo';
          break;
        case 5:
          nombreEstado = 'No Utilizable';
          break;
        // Agrega más casos según tus necesidades
      }
    }

    return nombreEstado;
  }

  aceptar() {
    this.router.navigate(['/']);
  }

  agregarEtiqueta() {
    if (this.libro.id != undefined && this.libro.titulo) {
      window.localStorage.setItem('idlibro', this.libro.id.toString());
      localStorage.setItem('titulolibro', this.libro.titulo)
      this.router.navigate(['/app-reg-etiquetas']);
    }
  }

  public dato!: Observable<any['']>;


  obtenerAutor(): void {
    this.dato = this.ListaT.obtenerAutores();

    


  }


  selectedAutor: any;

  capturarAutor(posicion: any) {

    if (posicion && posicion.nombre) {
      this.autor1 = posicion;

      this.autores_libros1.autor = this.autor1

    }

  }

  // ESTO ES PARA CAPTURAR EL DONANTE
  public dato1!: Observable<any['']>;
  obtenerDonante(): void {
    this.dato1 = this.ListaT.listarDonate();
  


  }

  selectedDonante: any

  capturarDonante(e: any) {

    this.selectedDonante = e

    if (this.selectedDonante && this.selectedDonante.nombre) {
      this.librosF.get('donante')?.patchValue(this.selectedDonante);

      // Establecer el valor en el formulario
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

  capturarImagen(event: any): any {
    const archivocapturado = event.target.files[0]
    this.imagen = event.target.files[0]
    this.extraerBase64(archivocapturado).then((imagen: any) => {
      this.previsualizacion = imagen.base;
    })

  }

  editar() {
    this.isDisabled = false;
    this.ngOnInit();
  }


  EditarLibro() {
    const librosFCopy = JSON.parse(JSON.stringify(this.librosF.getRawValue()));


    if (this.libro.id) {
      this.libroservice.editar(this.libro.id, librosFCopy).subscribe(
        respose => {

        }
      )

      if (this.autores_libros.id) {
        this.listaservice.editarAutor(this.autores_libros.id, this.autores_libros1).subscribe(
          respose => {

          }
        )
      }

      if (this.imagen) {
        this.libroservice.subirImagen(this.libro.id, this.imagen).subscribe(
          (response: any) => {

            Swal.fire({
              position: 'center',
              icon: 'success',
              title: '<strong>Se ha editado un Libro</strong>',
              showConfirmButton: false,
              timer: 1500
            });

            setTimeout(() => {
              this.ngOnInit();
              // location.reload();
            }, 1000);
          },
          (error: any) => {
            console.error('Error al subir la imagen:', error);
            // Maneja el error de acuerdo a tus necesidades
          }
        );

      }

      Swal.fire({
        position: 'center',
        icon: 'success',
        title: '<strong>Se ha editado un Libro</strong>',
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => {
        
         location.reload();
      }, 1000);
    }
  }
  Aceptar() {
    this.router.navigate(['/']);

  }

}


