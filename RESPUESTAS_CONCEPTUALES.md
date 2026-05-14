# Respuestas Conceptuales - Taller WeatherAndes

## Sobre Observables y Asincronía

### ¿Por qué las peticiones HTTP en Angular devuelven un Observable en lugar de la data directa? ¿Qué diferencia hay frente a una Promise?

Angular devuelve un Observable porque HTTP es asíncrono y porque RxJS permite componer flujos de datos de forma elegante:
- **Observable**: Emite cero, uno o múltiples valores. Puede cancelarse al desuscribirse. Ofrece operadores muy potentes (`map`, `filter`, `retry`, `switchMap`, etc.).
- **Promise**: Emite un único valor. No se cancela de forma nativa. Más simple pero menos flexible.

### ¿Qué ocurre si un componente llama a un servicio HTTP pero nunca hace `.subscribe()`? ¿Se ejecuta la petición igualmente?

No, la petición **no se ejecuta**. Los Observables de HTTP en Angular son "cold" (perezosos): solo arrancan cuando alguien se suscribe. Esto evita peticiones innecesarias y permite reutilizar el Observable de varias formas.

---

## Sobre Inyección de Dependencias

### ¿Qué ventaja de modularidad da `providedIn: 'root'` frente a instanciar el servicio manualmente con `new CityService()` dentro un componente?

**`providedIn: 'root'`:**
- Crea un singleton gestionado por Angular automáticamente.
- Tree-shakeable (Angular elimina código no usado en prodcción).
- Desacoplado del componente; reutilizable en toda la app.
- Facilita testing e inyección de mocks.
- Configurable a nivel central.

**`new CityService()`:**
- Crea instancias locales, aumentando consumo de memoria.
- Rompe el contenedor DI; hay que resolver manualmente dependencias (HttpClient, etc.).
- Difícil de testear; imposible inyectar mocks.
- Aumenta complejidad de mantenimiento.

### ¿Cómo facilitaría la inyección de dependencias la escritura de pruebas unitarias para estos servicios?

DI permite **inyectar mocks/stubs** en lugar de implementaciones reales:
- Usar `HttpTestingController` para simular respuestas HTTP sin red real.
- Crear servicios fake con respuestas controladas.
- Aislar completamente la lógica bajo test, sin dependencias externas.
- Pruebas más rápidas y determinísticas.

Ejemplo:
```ts
TestBed.configureTestingModule({
  providers: [
    CityService,
    { provide: HttpClient, useValue: mockHttp }
  ]
});
```

---

## Sobre Interceptores

### ¿Por qué es mejor centralizar el manejo de errores en HttpInterceptor en lugar de poner bloques try/catch en cada componente?

1. **Evita duplicación**: Un solo lugar para toda lógica de errores HTTP.
2. **Consistencia**: Mismo mensaje y formato para todos los endpoints.
3. **Asincronía**: `try/catch` en Angular no captura bien errores de Observables; `catchError` en la cadena RxJS sí funciona.
4. **Mantenibilidad**: Cambios globales sin tocar componentes.
5. **Separación de responsabilidades**: Componentes se enfocan en lógica de negocio.

### Mencione dos casos de uso adicionales para un interceptor además del manejo de errores

1. **Agregar token de autenticación**: Inyectar `Authorization: Bearer <token>` en cada request automáticamente.
2. **Logging y telemetría**: Registrar request/response, tiempos, medir performance.
3. **Reintentos con backoff**: Aplicar política de retry para errores transitorios.
4. **Transformación de data**: Mapear respuestas antes de que lleguen al componente.

---

## Sobre el Patrón Maestro-Detalle

### ¿Por qué se usa `@Input()` para pasar la ciudad a CityDetailComponent en lugar de volver a hacer un GET a `/api/cities/{id}`?

1. **Rendimiento**: Evita una llamada HTTP extra; los datos ya están en memoria del maestro.
2. **Latencia**: El detalle se muestra inmediatamente sin esperar red.
3. **UX**: Sin parpadeos ni retrasos percibidos.
4. **Eficiencia**: Reutiliza datos ya obtenidos.

### Observe que en la respuesta de `GET /api/cities`, el campo `country` ya viene como objeto anidado (no solo el countryId). ¿Qué ventaja de diseño tiene esta decisión del backend para el frontend?

1. **Evita N+1 queries**: Si hubiera solo `countryId`, necesitaríamos un GET adicional por cada ciudad para resolver el país.
2. **Simplifica render**: El componente ya tiene acceso a `city.country.name` sin lógica extra.
3. **Reduce complejidad**: No hay que implementar lógica de join/lookup en cliente.
4. **API amigable**: El backend devuelve datos directamente usables por el frontend.
5. **Consistencia**: Siempre tienes el contexto completo (ciudad + país) junto.
