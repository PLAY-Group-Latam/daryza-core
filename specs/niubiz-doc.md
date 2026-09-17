---
updatedAt: 2026-09-15T22:27:16.000Z
---

Fetch the complete documentation index at: https://desarrolladores.niubiz.com.pe/llms.txt. Use this file to discover all available pages before exploring further. Append .md to any documentation page URL to get its markdown version.

# Botón de Pago Web

<HTMLBlock>{`
<div></div>
<style>
h1 {
  color: #01092E;
}
.field-description hr, .markdown-body hr{
      border-bottom: 2px solid #e2e2e2;
  }x
.rdmd-table-inner {
  position: relative;
  /*height: 120px;*/
}
.markdown-body .rdmd-table table:only-child thead tr,
.markdown-body .rdmd-table table:only-child thead th:last-child {
  background-color: #212121;
  color: white;
}

.markdown-body .rdmd-table-inner {
border-top-left-radius: 8px;
border-top-right-radius: 8px;
}
.markdown-body .rdmd-table-inner table {
border-top-left-radius: 8px;
border-top-right-radius: 8px;
width: 100%;
}
.markdown-body .rdmd-table-inner table thead tr th {
position: sticky;
top: 0;
z-index: 0;
}

/********estilos para tablas grandes********/

.rdmd-table-inner-large {
position: relative;
}
.markdown-body .rdmd-table-large table:only-child thead tr,
.markdown-body .rdmd-table-large table:only-child thead th:last-child {
background-color: #212121;
color: white;
}
.markdown-body .rdmd-table .rdmd-table-inner table:only-child thead th {
text-align: center !important;
}
.markdown-body .rdmd-table-inner-large {
border-top-left-radius: 8px;
border-top-right-radius: 8px;
overflow:auto;
height:500px;
}
.markdown-body .rdmd-table-inner-large table {
border-top-left-radius: 8px;
border-top-right-radius: 8px;
width: 100%;
overflow:auto;
height:500px;
}
.markdown-body .rdmd-table-inner-large table thead tr th {
position: sticky;
z-index: 0;
}
.markdown-body .rdmd-table-inner-large table thead tr th .text-center{
position: sticky;
z-index: 1;
}

/******************************/

/_tamaño para los codigos ejemplos_/
.cm-s-neo {
font-size: 12px;
}
.CodeTabs-toolbar {
font-size: 18px;
}

    .markdown-body>.img img{
    width: 90%;
    border: 1px solid #01092E;
    border-radius: 8px

}

</style>
`}</HTMLBlock>

<HTMLBlock>{`

`}</HTMLBlock>

<HTMLBlock>{`
<div id="popup0" class="overlay ">
	<div class="popup0 modal-dialog modal-dialog-centered modal-dialog-scrollable">
		<h2>Descripción y flujo de la solución</h2>
    <hr>
		<a class="close0" href="#">&times;</a>
		<div class="content0">
      <ol>
        <li>
        <p>El Comercio haciendo uso de sus credenciales genera un token de acceso <strong>(1a)</strong> y haciendo uso del token de acceso genera un token de sesión <strong>(2a)</strong>. El Comercio con el token de sesión y otros parámetros (canal, importe, número de pedido, etc.) invoca al botón de pago web <strong>(3a)</strong>.</p>
        </li>
        <li>
        <p>El Tarjetahabiente ingresa la información de su tarjeta en el formulario de pagos dependiendo el método de pago elegido y presiona el botón “Pagar” <strong>(4a)</strong>, entonces el botón de pago web devolverá al Comercio un token de transacción <strong>(4c)</strong> como respuesta a la validación de la transacción. Finalmente, el Comercio envía un token de acceso, el token de transacción del punto anterior y otros parámetros (canal, importe, número de pedido, etc.) para realizar la autorización de la transacción <strong>(5a)</strong>.</p>
        </li>
        <li>
        <p>Se recomienda tener un flujo de extorno automático para el pago <strong>(5c)</strong>. Actualmente manejamos un tiempo de espera de 60 segundos para todas las API del flujo, por lo que si pasa de este tiempo se retornará un código 504. El comercio puede cortar la comunicación en la cantidad de tiempo que considere (< 60 seg) , y posteriormente consumir el API de consulta (para saber el estado de la venta) y el API de Anulación por Extorno que están en <a href="https://desarrolladores.readme.io/docs/bot%C3%B3n-de-pago-1#api-complementarias">APIs Complementarias</a>.</p>
        </li> 
      </ol>
		</div>
	</div>
</div>

<style>
body {
  height: 100vh;
}

h1 {
  text-align: center; 
  color: #01092E !important;
  margin: 80px 0;
}
  
.overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  transition: opacity 500ms;
  visibility: hidden; 
  opacity: 0;
  z-index: 1;
}
.overlay:target {
  visibility: visible;
  opacity: 1; 
}

.popup0 {
  margin: 150px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  width: 60%;
  height: 70%;
  position: relative;
  transition: all 5s ease-in-out;
}
  
.popup0 li p{
  height: auto; 
  height:100%;
  }
.popup0 h2 {
  margin-top: 0;
  /*color: #46b8da;*/ 
  color:#03a9f4;
  text-align: center;
}
.popup0 .close0 {
  position: absolute;
  top: 20px;
  right: 30px;
  transition: all 200ms;
  font-size: 30px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}
.popup0 .close0:hover {
  color: #03a9f4;
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}
.popup0 .content0 {
  max-height: 80%;
  overflow: auto;
}
  ::marker {
    unicode-bidi: isolate;
    font-variant-numeric: tabular-nums;
    text-transform: none;
    text-indent: 0px !important;
    text-align: start !important;
    text-align-last: start !important;
    color: #03a9f4;
}
</style>

`}</HTMLBlock>

<HTMLBlock>{`

<div id="popup1" class="overlay ">
	<div class="popup modal-dialog modal-dialog-centered modal-dialog-scrollable">
		<h2>Requisitos y Restricciones</h2>

    <hr>
    	<a class="close" href="/v1.1/docs/bot%C3%B3n-de-pago-1#requisitos-y-restricciones">&times;</a>
    	<div class="content">
    		Para comenzar la integración, primero verifica los siguientes requisitos:

      <ul class="requisitos-restricciones-ul" style="list-style: decimal;margin: 0 0 10px 15px;">
    <li>
        <p>El comercio afiliado debe asegurar que su integración (desarrollo) sea lo más segura posible aplicando
            las medidas preventivas que considere necesario.</p>
    </li>
    <li>
        <p>Todas las invocaciones a las APIs (servicios backend) de Niubiz tienen que ser realizadas host to
            host.</p>
    </li>
    <li>
        <p>El comercio afiliado recibirá un <strong>Usuario</strong> y una <strong>Contraseña</strong> (Credenciales)
            para poder invocar al API de Seguridad y crear un token de acceso, el cual se utilizará en siguientes
            llamadas a APIs funcionales.</p>
    </li>
    <li><p>El comercio es responsable de custodiar sus credenciales de acceso, por ende, estas no deben estar dentro del
        código fuente de su aplicación o publicadas en algún repositorio
        público (Github, Bitbucket, etc.), dado que se trata de información sensible.</p></li>
    <li><p>El botón de pago web funciona en los siguientes navegadores actualizados al protocolo TLS versión 1.2:</p>
    </li>
    <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
        <li> Microsoft Edge 80+</li>
        <li> Chrome 30+</li>
        <li> Firefox 27+</li>
        <li> Safari 7+</li>
    </ul>
    <li><p>El botón de pago web se adapta a todos los dispositivos móviles (smartphones y tablets) con los siguientes
        sistemas operativos:</p></li>
    <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
        <li> Android</li>
        <li> iOS</li>
    </ul>
    <li><p>El botón de pago web puede integrarse en el componente Android <strong>“WebView</strong>” (El cual se basa en
      Chromium). Se recomienda implementar el <strong>“WebView</strong>” a partir de la versión 33.</p>

<p>Antes de cargar el checkout de Niubiz, normalizar el User-Agent eliminando "Version/4.0 ":</p>
      <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
        <li>val fixedUa = originalUa.replace("Version/4.0 ", "")webView.settings.userAgentString = fixe	</li>
		</ul>
  <p>Importante: aplicar el cambio en dos momentos:</p>
    <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
        <li> 1. Al crear un WebView nuevo.</li>
        <li> 2. Al reutilizar un WebView de un pool (este caso es crítico: si el WebView ya existía, la corrección no se volvía a aplicar).</li>
    </ul>
</li>
    <li><p>
        El botón de pago web puede integrarse en el componente iOS <strong>“WKWebView”</strong> (El cual se basa en
        Chromium). Este componente tiene soporte a partir de la versión iOS 8.0 y OS 10.10.
    </p></li>
    <li><p>En el botón <strong>“Pagar”</strong> dentro del formulario de pagos no se debe utilizar un color hexadecimal
        bajo, dado que el color del texto del botón <strong>“Pagar”</strong> será siempre blanco.
    </p></li>
    <li><p>Ten en cuenta los lineamientos para configurar visualmente tu web <strong><a href="/v1.1/docs/se%C3%B1aliza-tu-web">aquí.</a></strong>
    </p>
    </li><li><p>Recuerda que debes considerar los requisitos y restricciones que aplican a la solución que estás integrando,
        debes revisar esta sección. 
    </p></li>
    <li><p>Recuerda que debes inluir un grupo de campos obligatorios denominados MDDs en la trama de tu integración,
        este lista de MDDs será entregada por el equipo de integraciones, para solicitarla puedes contactarte con
        integraciones.niubiz@necomplus.com con su Código de Comercio / RUC / Razón Social con el asunto Consulta
        MDDs.</p></li>
    <li><p>Se recomienda tener un flujo de extorno automático para el pago. Actualmente manejamos un tiempo de espera de
        60 segundos para todas las API del flujo, por lo que si pasa de este tiempo se retornará un código 504. El
        comercio puede cortar la comunicación en la cantidad de tiempo que considere (&lt; 60 seg), y posteriormente
        consumir el API de consulta (para saber el estado de la venta) y el API de Anulación por Extorno que están en
        <a href="/v1.1/docs/bot%C3%B3n-de-pago-1#api-complementarias">APIs Complementarias.</a></p></li>
    <li><p>Para que un pago se pueda efectuar se deben seguir todos los pasos del flujo descrito <a href="/v1.1/docs/bot%C3%B3n-de-pago-1#pasos-para-integrarse">(Pasos para integrarse)</a> , desde el paso 1 hasta el
        paso 4, en caso contrario saldrá denegado. Para efectos de un nuevo
        intento de pago aplica lo mismo, ya que se necesitan nuevos valores de sesión para realizar otro pago.</p></li>
    <li><p>El nuevo método de pago del botón de Niubiz les permitirá a tus clientes realizar compras usando puntos o
        millas. Para ello, deberás solicitarle al Banco, dueño del programa de puntos o millas, que te habilite la
        funcionalidad a través de nosotros.
    </p></li>
</ul>
		</div>
	</div>
</div>
<style>

body {
height: 100vh;
}

h1 {
text-align: center;
color: #03a9f4;
margin: 80px 0;
}

.overlay {
position: fixed;
top: 0;
bottom: 0;
left: 0;
right: 0;
background: rgba(0, 0, 0, 0.7);
transition: opacity 500ms;
visibility: hidden;
opacity: 0;
z-index: 1;
}
.overlay:target {
visibility: visible;
opacity: 1;
}

.popup {
margin: 70px auto;
padding: 20px;
background: #fff;
border-radius: 8px;
width: 60%;
height: 70%;
position: relative;
transition: all 5s ease-in-out;
}

.popup li p{
height: auto;
height:100%;
}
.popup h2 {
margin-top: 0;
color:#03a9f4;
text-align: center;
}
.popup .close {
position: absolute;
top: 20px;
right: 30px;
transition: all 200ms;
font-size: 30px;
font-weight: bold;
text-decoration: none;
color: #333;
}
.popup .close:hover {
color: #03a9f4;
}
.popup .content {
max-height: 90%;
overflow: auto;
}
</style>
`}</HTMLBlock>

## **Descripción y flujo de la solución**

<HTMLBlock>{`
  <hr>
`}</HTMLBlock>

<Callout icon="📘" theme="info">
  ### Descripción de Flujo

Lee la descripción completa [aquí](#popup0)
</Callout>

![](https://files.readme.io/9caaf37-Boton-de-Pago-V2.jpg 'Boton-de-Pago-V2.jpg')

<Callout icon="📘" theme="info">
  ### Requisitos y Restricciones

Para más información sobre requisitos y restricciones da click [aquí](#popup1)
</Callout>

## **Pasos para integrarse**

<HTMLBlock>{`
 <hr>
`}</HTMLBlock>

<Callout icon="🚧" theme="warn">
  ### Considerar

- _El comercio afiliado debe asegurar que su integración (desarrollo) sea lo más segura posible aplicando las medidas preventivas que considere necesario._
- _Todas las invocaciones a las APIs (servicios backend) de Niubiz tienen que ser realizadas host to host._
- Si aún no estás afiliado y no cuentas con tu código de comercio pago web, puedes solicitarlo llamando: Lima: (01) 614-9800 / Provincia: 080 100 100
- Obligatorio: Revisa los requisitos y restricciones [aquí](#popup1).
  </Callout>

Puedes descargar un ejemplo de las APIs en Postman [aquí](https://togetniuz-my.sharepoint.com/:u:/g/personal/ssandoval_niubiz_com_pe/ETAx4rhuzUJFnCC8rVUwaoMBirPpi8lD9rCBTwf8poNAig?e=auyY9o).

### 1️⃣ Crear un token de acceso (Seguridad)

**A. Descripción y consideraciones**

El token de acceso de seguridad te permitirá usar las demás APIs necesarias para mostrar el formulario de pago en tu página web y realizar el cobro.

Ten en cuenta que el token de acceso tiene un tiempo de vigencia de 60 minutos. Si el token caduca, se deberá generar uno nuevo.

**B. Endpoint**

<HTMLBlock>{`
<div class="rdmd-table">
<div class="rdmd-table-inner container-table-standar scroll-responsive">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Ambiente</th>
                    <th class="text-center">URL API</th> 
                </tr>
                </thead>
                <tbody> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Sandbox</td> 
                    <td class="borderBottom" style=" color: #03a9f4">https://apisandbox.vnforappstest.com/api.security/v1/security</td>
                </tr> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Producción</td> 
                    <td class="borderBottom" style=" color: #03a9f4">https://apiprod.vnforapps.com/api.security/v1/security
                    </td>
                </tr>
                </tbody>
            </table>
        </div> </div>
`}</HTMLBlock>

**C. Request**

- **C.1 Tabla de Campos - Header**

<Table align={["left","left","left","left","left"]}>
  <thead>
    <tr>
      <th>
        Campo
      </th>

      <th>
        Tipo
      </th>

      <th>
        Longitud
      </th>

      <th>
        Obligatorio
      </th>

      <th>
        Descripción
      </th>
    </tr>

  </thead>

  <tbody>
    <tr>
      <td>
        Authorization
      </td>

      <td>
        Texto
      </td>

      <td>
        2050
      </td>

      <td>
        **SI**
      </td>

      <td>
        El texto Basic concatenado con el usuario y password en base 64

        Basic EncodeBase64(“userName” + “:” + “password”)
      </td>
    </tr>

  </tbody>
</Table>

Las credenciales (userName y password):

- En sandbox el userName = <integraciones@niubiz.com.pe> y password = \_7z3\@8fF
- En producción: Te entregaremos las credenciales de acceso a producción (Luego de concluir con Certificación y pase a producción).

<br />

- **C.2 Trama de ejemplo:**

```json Request
GET /api.security/v1/security HTTP/1.1
Host: apisandbox.vnforappstest.com
Authorization: Basic Z2lhbmNhZ2FsbGFyZG9AZ21haWwuY29tOkF2MyR0cnV6
(*) Authorization: Basic EncodeBase64(“userName” + “:” + “password”)
```

**D. Response**

- **D.1 Tabla de campos:**

<HTMLBlock>{`
<div class="rdmd-table">
<div class="rdmd-table-inner container-table-standar scroll-responsive">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Campo</th>
                    <th class="text-center">Tipo</th>
                    <th class="text-center">Longitud</th>
                    <th class="text-center">Obligatorio</th>
                    <th class="borderRight text-center">Descripción</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">TRAMA EXITOSA
                        201
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">accessToken</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 2050</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Token de acceso generado con la API</td>
                </tr>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">TRAMA ERROR 401
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">description</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 2050</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Descripción relacionada al error. <br>Este error se
                        presenta cuando las credenciales no son válidas.
                    </td>
                </tr>
                </tbody>
            </table>
        </div> </div>
`}</HTMLBlock>

- **D.2 Trama de ejemplo**

```json Caso 201
Token de acceso de seguridad, generado exitosamente

Status Code 201 Created
Content-Type: text/plain
eyJraWQiOiJmWk1tV3pZR0RBckxHektvalNCK2w3SjFhMnNPXC9zQnNwOTlNNmNuM3F5MD0iLCJhbGciOi JSUzI1NiJ9.eyJzdWIiOiJkMTlhM2I0Zi01NzYxLTRlYTEtYjBmYS1iNWNiNjU5OWQ5NWQiLCJjb2duaX RvOmdyb3VwcyI6WyJjdXN0b2RpbyJdLCJldmVudF9pZCI6ImM2OTZmZjVkLTZjOTctNDE4NC05MGIxLTA 5NjM2MWY4M2E2ZSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmlu LnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MDIxMTM4NzksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvL WlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xXzJjSjFTZTFmSSIsImV4cCI6MTYwMj ExNzQ3OSwiaWF0IjoxNjAyMTEzODc5LCJqdGkiOiJiOTVmOGU0ZS1kZGE4LTRkZmUtOTc0NC1kOGQwZGE yMDFlMzMiLCJjbGllbnRfaWQiOiIxMGx2MDYxN281ZGljNTFlYnNucWVpaWpiNyIsInVzZXJuYW1lIjoi Z2lhbmNhZ2FsbGFyZG9AZ21haWwuY29tIn0.GrO2XLoMnChN3Dg6H8G7LC3ZY4O_c1-DwvRYHCx8iiDqp rFMK7jU43vo6W4ILNqP_QA1sDoEQaD9HJJ7iLfVBojh1tgiFyzFzkX4T3m63eHRSFfIZAToTGYOQoeZch sYb3UAffvrzR1JlUPjwf3U1YRfBEu8ueIR6_OUMZdXC8TLS3pqEpXnPr6S-_bndpFRs5wZpt0BPSJ4Onh M2AYh6pqFucjL9nsPmIaujJQVwdR8oNcrfeFuIv5t55H_DRDpQCSYstac1nFSm00P3EMdbOX6Lh8dTU5d BOXe17Bfh7mDEP-FnF_J47COVFB_sYh7JXyePfK6kKTlSeV0Ev0pew
```

```json Caso 401
Error en la generación del token, por utilizar credenciales (userName o password) incorrectos en ambiente de sandbox o producción

Status Code 401 Error
Content-Type: text/plain
Unauthorized access
```

### 2️⃣ Crear un token de sesión

**A. Descripción y consideraciones**

El token de sesión te permitirá mostrar el formulario de pago en tu página web. Se crea a partir del token de acceso de seguridad generado en el paso 1.

Cada vez que se crea un nuevo token de sesión: Es necesario generar un nuevo token de acceso de seguridad.

El token de sesión solo puede ser utilizado una vez. Además, tiene un tiempo de vigencia. Si el token de sesión expira, se debe generar uno nuevo para continuar utilizando el servicio.

**B. Endpoint**

<HTMLBlock>{`
<div class="rdmd-table">
<div class="rdmd-table-inner container-table-standar scroll-responsive">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Ambiente</th>
                    <th class="text-center">URL API</th> 
                </tr>
                </thead>
                <tbody> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Sandbox</td> 
                    <td class="borderBottom" style=" color: #03a9f4">https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session/{merchantId}</td>
                </tr> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Producción</td> 
                    <td class="borderBottom" style=" color: #03a9f4">https://apiprod.vnforapps.com/api.ecommerce/v2/ecommerce/token/session/{merchantId}
                    </td>
                </tr>
                </tbody>
            </table>
        </div> </div>
`}</HTMLBlock>

**C. Request**

- **C.1 Tabla de campos:**

<HTMLBlock>{`
<div class="rdmd-table-large">
  <div class="rdmd-table-inner-large">
    <table>
      <thead>
        <tr>
          <th class="text-center">Campo</th>
          <th class="text-center">Tipo</th>
          <th class="text-center">Longitud</th>
          <th class="text-center">Obligatorio</th>
          <th class="text-center">Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">PATH</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">merchantId</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">9</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">
          Código de comercio asociado a la venta.
            <ul>
            <li><b>Sandbox</b>: Usar un código de pruebas de la sección “Data de prueba”.</li>
              <li><b>Producción</b>: Usa el código de comercio que se te proporcionó al afiliarte al producto de pago web.</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">HEADER</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">Authorization</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 1000</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Access Token generado en el Api de Seguridad </td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">Content-Type</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom"></td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Propiedad de header usada para indicar el media type del recurso. Valor asignado: application/json </td>
        </tr>
        <tr>
          <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">BODY</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">channel</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 45</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Canal de registro. Valor por defecto: “web”</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">amount</td>
          <td class="borderBottom">Numérico</td>
          <td class="borderBottom">6,2</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Importe de la transacción. Formato ####.## (Dos decimales separados por punto) Ejemplo: 1000.00 <br>
          </td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">antifraud</td>
          <td class="borderBottom"></td>
          <td class="borderBottom"></td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Objeto antifraude</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">clientIp</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 45</td>
          <td class="borderBottom">NO</td>
          <td class="borderBottom" style="width:300px">Dirección IP del cliente</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">merchantDefineData</td>
          <td class="borderBottom"></td>
          <td class="borderBottom"></td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">
            Objeto MDD:
            <br>Son datos obligatorios que envía el comercio a Niubiz, para un mejor performance de las reglas antifraudes.
          </td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">MDD4</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 80</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">
            Email que el cliente ingresó en el registro o el que coloca durante el proceso de compra. Alfanúmerico,Debe incluir una "@" y al menos un "."
            <br>Ejemplo: email@email.com
          </td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">MDD32</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 80</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">
            Identificador único del cliente de cara al comercio: Se pueden utilizar datos como el DNI o correo electrónico siempre y cuando estos no se repitan (ej: clientes con múltiples correos registrados).
            <br>Ejemplo: JD1892639123
          </td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">MDD75</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 15</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">
            Tipo de registro de cliente: Siempre que tenga un registro en la web del comercio.
            <br>Valores que puede tomar:
            - Registrado
            - Invitado
            - Empleado
          </td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">MDD77</td>
          <td class="borderBottom">Numérico</td>
          <td class="borderBottom">Max 50</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">
            Días de registro del cliente: Siempre que tenta un registro en la web del comercio.
            <br>Valores: Números enteros positivos.
            <br>Ejemplo: 1256
          </td>
        </tr>

        <tr class="text-center content-td-table-st">
          <td class="borderBottom">dataMap</td>
          <td class="borderBottom"></td>
          <td class="borderBottom"></td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Objeto DataMap</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">cardholderCity</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 50</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Ciudad o Distrito del cliente.</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">cardholderCountry</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">2</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">País de compra del cliente. Se debe enviar dos dígitos en formato ISO 3166. Ejemplo: PE</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">cardholderAddress</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 60</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Dirección del cliente.</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">cardholderPostalCode</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">Max 9</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Codigo Postal del cliente.</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">cardholderState</td>
          <td class="borderBottom">Texto</td>
          <td class="borderBottom">3</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Departamento de compra del cliente. Se debe enviar 3 dígitos en formato ISO 3166. Ejemplo: LIM</td>
        </tr>
        <tr class="text-center content-td-table-st">
          <td class="borderBottom">cardholderPhoneNumber</td>
          <td class="borderBottom">Numérico</td>
          <td class="borderBottom">Max 15</td>
          <td class="borderBottom"><b>SI</b></td>
          <td class="borderBottom" style="width:300px">Número de teléfono del cliente.</td>
        </tr>
      </tbody>
    </table>

  </div>
</div>
`}</HTMLBlock>

- **C.2 Trama de ejemplo:**

Considerar que los valores de los campos del objeto merchantDefineData, solo son ejemplos. En tu integración debes capturar estos datos de tus clientes y enviarlos en cada venta.

```json Request
POST /api.ecommerce/v2/ecommerce/token/session/456879852 HTTP/1.1
Host: apisandbox.vnforappstest.com
Content-Type: application/json
Authorization: eyJraWQiOiJmWk1tV3pZR0RBckxHektvalNCK2w3SjFhMnNPXC9zQnNwOTlNNmNuM3F 5MD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkMTlhM2I0Zi01NzYxLTRlYTEtYjBmYS1iNWNiNjU5OWQ 5NWQiLCJjb2duaXRvOmdyb3VwcyI6WyJjdXN0b2RpbyJdLCJldmVudF9pZCI6ImM2OTZmZjVkLTZjOTct NDE4NC05MGIxLTA5NjM2MWY4M2E2ZSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ 25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MDIxMTM4NzksImlzcyI6Imh0dHBzOl wvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xXzJjSjFTZTFmSSI sImV4cCI6MTYwMjExNzQ3OSwiaWF0IjoxNjAyMTEzODc5LCJqdGkiOiJiOTVmOGU0ZS1kZGE4LTRkZmUt OTc0NC1kOGQwZGEyMDFlMzMiLCJjbGllbnRfaWQiOiIxMGx2MDYxN281ZGljNTFlYnNucWVpaWpiNyIsI nVzZXJuYW1lIjoiZ2lhbmNhZ2FsbGFyZG9AZ21haWwuY29tIn0.GrO2XLoMnChN3Dg6H8G7LC3ZY4O_c1 -DwvRYHCx8iiDqprFMK7jU43vo6W4ILNqP_QA1sDoEQaD9HJJ7iLfVBojh1tgiFyzFzkX4T3m63eHRSFf IZAToTGYOQoeZchsYb3UAffvrzR1JlUPjwf3U1YRfBEu8ueIR6_OUMZdXC8TLS3pqEpXnPr6S-_bndpFR s5wZpt0BPSJ4OnhM2AYh6pqFucjL9nsPmIaujJQVwdR8oNcrfeFuIv5t55H_DRDpQCSYstac1nFSm00P3 EMdbOX6Lh8dTU5dBOXe17Bfh7mDEP-FnF_J47COVFB_sYh7JXyePfK6kKTlSeV0Ev0pew
{
  "channel": "web",
  "amount": 10.5,
  "antifraud": {
    "clientIp": "24.252.107.29",
    "merchantDefineData": {
      "MDD4": "integraciones@niubiz.com.pe",
      "MDD32": "JD1892639123",
      "MDD75": "Registrado",
      "MDD77": 458
    }
  },
  "dataMap": {
    "cardholderCity": "Lima",
    "cardholderCountry": "PE",
    "cardholderAddress": "Av Jose Pardo 831",
    "cardholderPostalCode": "12345",
    "cardholderState": "LIM",
    "cardholderPhoneNumber": "987654321"
  }
}
```

**D. Response**

- **D.1 Tabla de campos:**

<HTMLBlock>{`
<div class="rdmd-table">
<div class="rdmd-table-inner container-table-standar scroll-responsive scroll-responsive-vertical">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Campo</th>
                    <th class="text-center">Tipo</th>
                    <th class="text-center">Longitud</th>
                    <th class="text-center">Obligatorio</th>
                    <th class="borderRight text-center">Descripción</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">TRAMA EXITOSA
                        200
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">sessionKey</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">64</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Token de sesión generado por el sistema</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">expirationTime</td>
                    <td class="borderBottom">Fecha</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Vigencia del token de sesión expresado en formato UNIX
                        TimeStamp
                    </td>
                </tr>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">TRAMA ERROR 400
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">errorCode</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de error</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">errorMessage</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">500</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Descripción del error</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Objeto con información complementaria relacionada al
                        error
                    </td>
                </tr>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">TRAMA ERROR 401
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">description</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 1000</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Descripción relacionada al error. Este error se presenta cuando el token de acceso es inválido o ya caducó.
                    </td>
                </tr>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; font-weight: normal; color: white; text-align: center">TRAMA ERROR 406
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">description</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 1000</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Descripción relacionada al error. Este error se
                        presenta
                        cuando se envía un formato incorrecto en el Request.
                    </td>
                </tr>
                </tbody>
            </table>
        </div>   </div>
`}</HTMLBlock>

- **D.2 Trama de ejemplo:**

```json Caso 200
Token de sesión generado exitosamente:

Status Code 200 OK
Content-Type: application/json
{
"sessionKey": "67cf73735f83590eabf1382ff49e5e08b261976326c6897cb764fd160a15a8ca",
"expirationTime": 1602183788142
}
```

```json Caso400
Ejm 1:  Token de acceso (seguridad) ya fue usado. Debe generar un nuevo token de acceso.

Status Code 400 Bad Request
Content-Type: application/json
{
"errorCode": 400,
"errorMessage": "Token has been used before",
"data": {}
}

Ejm 2: Token de acceso (seguridad), ya caducó:

Status Code 401 Error
Content-Type: text/plain
Unauthorized access

Ejm 3:  Uno de los campos enviados es incorrecto:

Status Code 400 Bad Request
Content-Type: application/json
{
"errorCode": 400,
"errorMessage": "{Nombre del campo} is not valid.",
"data": {}
}
```

```json Caso 406
No se está enviando la petición con el método POST:

Status Code 406 Not Acceptable
Content-Type: text/plain
Not Acceptable
```

### 3️⃣ Configurar el botón de pago web

**A. Descripción y consideraciones**

Para configurar el botón de pago web, necesitas referenciar una librería JS y tener un token de sesión válido.

En este paso, podrás cargar tu logo, configurar tiempo, tamaño , colores del botón y tu URL de respuesta.

**B. Endpoint**

<HTMLBlock>{`
<div class="rdmd-table">
<div class="rdmd-table-inner container-table-standar scroll-responsive">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Ambiente</th>
                    <th class="text-center">URL API</th> 
                </tr>
                </thead>
                <tbody> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Sandbox</td> 
                    <td class="borderBottom" style="color: #03a9f4">https://static-content-qas.vnforapps.com/env/sandbox/js/checkout.js</td>
                </tr> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Producción</td> 
                    <td class="borderBottom" style="color: #03a9f4">https://static-content.vnforapps.com/v2/js/checkout.js
                    </td>
                </tr>
                </tbody>
            </table>
        </div> </div>
`}</HTMLBlock>

**C. Request**

- **C.1 Tabla de campos:**

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Campo</th>
                    <th class="text-center">Tipo</th>
                    <th class="text-center">Longitud</th>
                    <th class="text-center">Obligatorio</th>
                    <th class="borderRight text-center">Descripción</th>
                </tr>
                </thead>
                <tbody>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">action</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 500</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Indica el URL al que debe hacer POST el
                        formulario. Se debe concatenar un ID como identificación de la
                        transacción para que puedas asociar a qué pedido pertenece el transactionCode
                        y otros campos que Niubiz devolverá en el POST. Ejemplo:<br>
                        https://www.dominio.com/paginaRespuesta?id=987978979 <br><br>
                      Para métodos de pago con redirecciones como Cuotéalo, es necesario enviar adicionalmente un identificador de sesión dentro de la URL para recuperar la sesión luego del redireccionamiento (deber ser una url completa, no solo un path). <br>Ejemplo:<br>
https://www.dominio.com/paginaRespuesta?id=987978979?WebSessionID=12340201
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">method</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 4</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Indica el método a utilizar que en este caso debe ser
                        POST
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-sessiontoken</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">64</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Token de sesión válido, generado en el paso 2.
                      <br>
                      Debe ser  único por cada transacción.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-channel</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 45</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Canal de registro.
                      <br>
                      Enviar siempre el valor: "web"</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-merchantid</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">9</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Código de comercio asociado a la venta.
                      <ul>
                      <li><b>Sandbox</b>: Usar de <b>"Data de prueba"</b>.</li>
                      <li><b>Producción</b>: Usa tu código de comercio generado en tu afiliación.</li>
                      </ul>
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-purchasenumber</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 12</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Número de Pedido, este valor es generado por el comercio y debe ser único por cada intento de autorización.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-amount</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Importe de la transacción. Formato ####.## (Dos
                        decimales
                        separados por punto) Ejemplo: 1000.00
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-expirationminutes</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Tiempo de duración de la sesión de pago expresado en
                        minutos
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-timeouturl</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 500</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Dirección URL de la aplicación del comercio para
                        redirección en caso de que exista un timeout durante el pago
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-merchantlogo</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 500</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">URL del logo del comercio. Altamente recomendable
                        incluir
                        un logo, caso contrario se mostrará el nombre del comercio. El tamaño sugerido es 187x40px.
                        <strong>Nota:</strong>
                        Si no inserta este valor, por no contar con una imagen como logo, es obligatorio colocar un
                        texto en
                        el campo “data-merchantname”
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-merchantname</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 25</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Nombre del comercio (se mostrará en caso se omita el
                        logo
                        en el campo “data-merchantlogo”). <strong>Nota:</strong> Si no inserta este valor es obligatorio
                        colocar la dirección URL de una imagen en el campo: “data- merchantlogo”
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-buttonsize</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 7</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Tamaño del Botón de Pago. Valor por defecto: DEFAULT.
                        Otros valores:
                        SMALL<br>
                        MEDIUM<br>
                        LARGE<br>
                        DEFAULT<br>
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-buttoncolor</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">4</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Color del Botón de Pago (Navy = Azul, Gray = Gris).
                        Valor por defecto: NAVY.
                        Otros valores:<br>
                        NAVY<br>
                        GRAY<br>
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data- formbuttoncolor</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">7</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Define el color del botón “Pagar” en el formulario.
                        Valor
                        por Defecto: Hexadecimal rojo (#FF0000)
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-showamount</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 5</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Indica si se muestra el monto a pagar en el botón Pagar
                        del
                        formulario.
                        Valor por defecto: TRUE.
                        Otros valores:<br>
                        TRUE<br>
                        FALSE<br>
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-cardholdername</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 25</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">
                      Nombres del titular de la tarjeta. No se permite caracteres especiales
                      <br>
                      Si no se envía el valor, el formulario de pago solicitará al cliente que lo ingrese.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-cardholderlastname</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 25</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">
                      Apellidos del titular de la tarjeta. No se permite caracteres especiales
                      <br>
                      Si no se envía el valor, el formulario de pago solicitará al cliente que lo ingrese.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-cardholderemail</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 25</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">
                      Correo electrónico del titular de la tarjeta. No se permite caracteres especiales
                      <br>
                      Si no se envía el valor, el formulario de pago solicitará al cliente que lo ingrese.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st"id="catact" >
                    <td class="borderBottom">data-usertoken</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 25</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Identificador del token de usuario para la funcionalidad de tarjeta recordada, se debe enviar un valor único UUID.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data-hidexbutton</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 5</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Permite ocultar el cerrar (X) en el formulario de pago.
                        Valor por defecto: FALSE. Otros valores:<br>
                        TRUE<br>
                        FALSE<br>
                    </td>
                </tr>
                </tbody>
            </table>
</div></div>
`}</HTMLBlock>

- **C.2 Casos de uso:**

<HTMLBlock>{`
<style>
  body {
    height: 100vh;
  }

  h1 {
    color: #03a9f4;
    margin: 80px 0;
  }

  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    transition: opacity 500ms;
    visibility: hidden;
    opacity: 0;
    z-index: 9999;
    pointer-events: none;
  }
  .overlay:target,
  .overlay.is-open {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  .popup-caso-uso {
    margin: 50px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    width: 60%;
    height: 80%;
    position: relative;
    transition: all 5s ease-in-out;
  }

  .popup-caso-uso li p {
    height: auto;
    height: 100%;
  }
  .popup-caso-uso h2 {
    margin-top: 0;
    color: #03a9f4;
    text-align: center;
  }
  .popup-caso-uso h3 {
    color: #03a9f4;
  }
  .popup-caso-uso .close0 {
    position: absolute;
    top: 20px;
    right: 30px;
    transition: all 200ms;
    font-size: 30px;
    font-weight: bold;
    text-decoration: none;
    color: #333;
  }
  .popup-caso-uso .close0:hover {
    color: #03a9f4;
    -webkit-transform: rotate(90deg);
    transform: rotate(90deg);
  }
  .popup-caso-uso .content0 {
    max-height: 80%;
    overflow: auto;
  }
  .popup-caso-uso .content0 ol {
    padding-left: 0em;
  }

  .borderContentTabCeleste {
    border: 1px solid #31a9f4;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    padding: 16px;
    background-color: white;
  }
  .codeAcordeon {
    display: inline-block;
    width: 60%;
    vertical-align: top;
    font-size: 11px;
  }
  .imageAcordeon {
    display: inline-block;
    width: 38%;
    vertical-align: top;
  }
  .image-row {
    display: flex;
    gap: 12px;
    align-items: stretch;
    margin: 12px 0;
    flex-wrap: nowrap;
  }
  .image-row .imageAcordeon {
    flex: 1 1 0;
    width: 33.333%;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image-row .imageAcordeon img {
    width: 100%;
    height: auto;
    max-height: 260px;
    object-fit: contain;
    border-radius: 8px;
    display: block;
  }
  .markdown-body pre > code {
    background-color: white;
  }
  .App .rm-Guides .rm-Article pre,
  .App .rm-ReferenceMain .rm-Article pre,
  .App .rm-Changelog .rm-Article pre {
    background-color: white;
  }

  .markdown-body pre > code {
    background-color: white;
    font-size: 12px;
    color: rgb(141, 141, 141);
    font-family: "courier new", monospace;
  }
  .markdown-body img {
    border-radius: 8px;
    padding-top: 5px;
  }
</style>

<main>
  <div class="categorias-btn1">
    <div class="col">
      <a href="#RegularBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Regular</span>
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#RecordarBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Recordar tarjeta</span>
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#recordar2BP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up"
                >Recordar tarjeta + <br />Ocultando datos del cliente</span
              >
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#ocultarBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Ocultando el monto en botón pagar</span>
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#tarjrecorBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Tarjeta recordada</span>
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#moscuoBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Mostrando cuotas</span>
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#tarjforBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Tarjeta foránea</span>
            </div>
            <div class="row">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#oculcerrBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up"
                >Ocultando cerrar (X) en el formulario</span
              >
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#qrBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Con QR</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#pagoefecBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Con PagoEfectivo</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#dccBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Con DCC</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#puntosBP" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Pago con Puntos Bbva / Millas IBK</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#pagoYape" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Pago con Yape</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#pagoCuotealo" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Pago con Cuotéalo BCP</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
    <div class="col">
      <a href="#pagoPlin" style="text-decoration: none">
        <div class="card-custom1">
          <div class="row">
            <div class="d-flex justify-content-center">
              <span class="title-up">Pago con Plin</span>
            </div>
            <div class=" ">
              <img
                class="img-flecha"
                alt="null"
                src="https://web-developer-static.s3.amazonaws.com/images/flecha.svg"
              />
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</main>

<style>
  :root {
    --gris-claro: #b8b8b8;
    --sombra: 0 0 13px 0 rgba(150, 150, 150, 0.25);
  }

  .rm-Article h1 {
    color: #03a9f4;
  }

  /*! ============= Categorias ============= */

  .categorias-btn1 {
    display: grid;
    grid-template-columns: repeat(4, 3fr);
    gap: 10px;
    margin-bottom: 20px;
    border-color: #03a9f4;
    position: relative;
  }
  /* Incio estilos card-custom */
  .card-custom1 {
    font-family: "Objective", sans-serif !important;
    box-sizing: border-box;
    background-color: white;
    border-radius: 8px !important;
    border: 0px solid #03a9f4 !important;
    flex-direction: row !important;
    height: 100px !important;
    width: 95%;
    position: relative;
    color: #111;
    cursor: pointer;
    box-shadow: 0 0 10px #ddd;
    align-items: center;
    display: flex;
    justify-content: center;
  }

  .card-custom1 .title-up {
    /*display: block; 
font-size: 14px;
text-transform: capitalize;
max-width: 250px;
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;
text-align: center;
margin: auto;
padding: auto;*/
    display: flex;
    font-weight: bolder;
    font-size: 14px;
    max-width: 250px;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
  }
  .card-custom1 .img-flecha {
    display: none;
  }
  /*
.card-custom1 .card-title {
font-weight: 700;
font-size: 20px;
text-align: center;
white-space: pre-line;
color: #000;
margin-top: auto;
margin-bottom: auto;
}
Se modifico */

  .card-custom1:hover {
    opacity: 1;
    border: 2px solid #03a9f4 !important;
    box-sizing: border-box;
    border-radius: 8px;
    cursor: pointer;
    animation: fadeIn ease 22s;
    background-color: #fff;
    -webkit-animation: fadeIn ease 2s;
    -moz-animation: fadeIn ease 2s;
    -o-animation: fadeIn ease 2s;
    -ms-animation: fadeIn ease 2s;
  }

  .card-custom1:hover .title-up {
    /*display: block;
font-weight: bolder;
font-size: 14px;
text-transform: capitalize;
max-width: 250px;
text-overflow: ellipsis;
white-space: nowrap;
overflow: hidden;*/
    display: block;
    font-weight: 300;
    font-size: 14px;
    max-width: 250px;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
    margin: auto;
    padding: auto;
  }

  .card-custom1:hover .img-flecha {
    display: block;
    max-width: 17px !important;
    background-repeat: no-repeat;
    margin-left: 5px;
    padding-top: 0px;
  }
</style>

<div id="RegularBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Regular</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre class="language-html"><code>
&lt;form action="paginaRespuesta" method="post"&gt;

&lt;script type="text/javascript" src="https://static
-content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;
</code>
</pre>
</div>
<div class="imageAcordeon">
<img
              src="https://files.readme.io/a5347d89e146cfbfa1e9a9e75e740e06fac7b6048e36f18ac605fb94239256ee-image.png"
              alt=""
            />
</div>
</div>

        <h3>Configuración Opción 2</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre class="language-html"><code>

&lt;script type="text/javascript" src="https://static
content-qas.vnforapps.com/v2/js/checkout.js" />
&lt;script type="text/javascript">
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5
e08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
VisanetCheckout.configuration.complete = procesar;

function procesar(parametros) {
console.log(parametros);
}
&lt;/script&gt;

</code>
                              </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://files.readme.io/a5347d89e146cfbfa1e9a9e75e740e06fac7b6048e36f18ac605fb94239256ee-image.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="RecordarBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Recordar tarjeta Boton de pago</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        Considerar que la opción de recordar tarjeta debe ser comunicada con
        Niubiz para requerir la activación de esta opción en el formulario.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre class="language-html"><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static
-content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;
</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-regular-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        Considerar que la opción de recordar tarjeta debe ser comunicada con
        Niubiz para requerir la activación de esta opción en el formulario.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre class="language-html"><code>

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5
e08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://files.readme.io/4ba93efc5fccf31df7d03e75965c519d4ff044c8df66945b05b2f009b7839f32-image.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="recordar2BP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Recordar tarjeta + Ocultando datos del cliente</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        Considerar que la casilla de tarjeta recordada sólo se verá si el comercio tiene activado la opción de recordar tarjeta con Niubiz.
        <br>Para que no se muestre en el formulario de pago, los campos de nombre, apellido y correo del cliente, estos valores se deben enviar en la configuración del botón de pago y además se debe solicitar a Niubiz que active la opción de ocultar estos campos, si es que ya fueron enviados en la configuración del js. De no enviarse estos campos en el js, el formulario siempre solicitará que se ingresen.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript"
src="https://static-content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
data-cardholdername="Juan"
data-cardholderlastname="Perez"
data-cardholderemail="jperez@xxx.com"
/&gt;
&lt;/form&gt;
</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://files.readme.io/ea345694ba6c50a2b71dea6437cded26800378b1e9b6b546fe09aeda6b8a3ae8-image.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        Considerar que la casilla de tarjeta recordada sólo se verá si el comercio tiene activado la opción de recordar tarjeta con Niubiz.
        <br>Para que no se muestre en el formulario de pago, los campos de nombre, apellido y correo del cliente, estos valores se deben enviar en la configuración del botón de pago y además se debe solicitar a Niubiz que active la opción de ocultar estos campos, si es que ya fueron enviados en la configuración del js. De no enviarse estos campos en el js, el formulario siempre solicitará que se ingresen.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
cardholdername:'Juan',
cardholderlastname:'Perez',
cardholderemail:'jperez@xxx.com',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
</code>
</pre>
</div>
<div class="imageAcordeon">
<img
              src="https://files.readme.io/ea345694ba6c50a2b71dea6437cded26800378b1e9b6b546fe09aeda6b8a3ae8-image.png"
              alt=""
            />
</div>
</div>
</ol>
</div>
  </div>
</div>

<div id="ocultarBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Ocultando el monto en botón pagar</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
data-showamount="false"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-ocultando-monto-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>

&lt;form action="paginaRespuesta" method="post"&gt;

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
showamount:'false',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-ocultando-monto-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="tarjrecorBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Tarjeta recordada</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        Considerar que la pantalla de tarjeta recordada sólo se verá si el
        comercio tiene activado la opción de recordar tarjeta con Niubiz.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
data-usertoken="jperez@gmail.com"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-recordada-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        Considerar que la pantalla de tarjeta recordada sólo se verá si el
        comercio tiene activado la opción de recordar tarjeta con Niubiz.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
usertoken:'jperez@gmail.com',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-recordada-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="moscuoBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Mostrando cuotas</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        Tener en cuenta que el campo de cuotas aparecerá sólo si se ha ingresado
        datos de la tarjeta y el bin tiene configurada las cuotas.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-mostrando-cuotas-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        Tener en cuenta que el campo de cuotas aparecerá sólo si se ha ingresado
        datos de la tarjeta y el bin tiene configurada las cuotas.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-mostrando-cuotas-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="tarjforBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Tarjeta foránea</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        Considerar que la opción de Tarjeta foránea puede tener también DCC,
        esta funcionalidad debe ser comunicada con Niubiz para requerir la
        activación de esta opción en el formulario.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-mostrando-cuotas-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        Considerar que la opción de Tarjeta foránea puede tener también DCC,
        esta funcionalidad debe ser comunicada con Niubiz para requerir la
        activación de esta opción en el formulario.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-foranea-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="oculcerrBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Ocultando cerrar (X) en el formulario</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
data-hidexbutton="true"
/&gt;
&lt;/form&gt;
</code>
              </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-ocultando-cerrar-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code>

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
hidexbutton:'true',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
        </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-con-tarjeta-ocultando-cerrar-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="qrBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Con QR</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="imageAcordeon">
            <img
              src="https://files.readme.io/92db9b5583ee57783433a3097796af090c2866bcc5e55b8b98cd2f9ead995d40-image.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="imageAcordeon">
            <img
              src="https://files.readme.io/ff2cba26bc987e542affd815e44494da8cb3fc1382e9bd5276e3a6714f149882-image.png"
              alt=""
            />
            <img
              src="https://files.readme.io/290e9029a0404d2eb04f5bbbd0805305f1b4865ffbaa3805dbd46231426a7284-image.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>

  </div>
</div>

<div id="pagoefecBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Con PagoEfectivo</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        Si el comercio tiene habilitada la opción de PagoEfectivo se mostrará la
        siguiente pantalla para seleccionar el medio de pago antes de todos los
        formularios anteriores.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code class="language-html">
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-pagoefectivo-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        Si el comercio tiene habilitada la opción de PagoEfectivo se mostrará la
        siguiente pantalla para seleccionar el medio de pago antes de todos los
        formularios anteriores.
        <br />
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code class="language-html">

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-pagoefectivo-detalle-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="dccBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Con DCC</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code class="language-html">
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=10.5
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-dcc-niubiz.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code class="language-html">

&lt;script type="text/javascript" src="https://static-
content-qas.vnforapps.com/v2/js/checkout.js" /&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:10.5,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago-dcc-niubiz.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>
  </div>
</div>

<div id="puntosBP" class="overlay">
  <div class="popup-caso-uso">
    <h2>Pago con Puntos Bbva / Millas IBK</h2>
    <hr />
    <a class="close0" href="#catact">&times;</a>
    <div class="content0">
      <ol>
        <h3>Configuración Opción 1</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code class="language-html">
&lt;form action="paginaRespuesta" method="post"&gt;
&lt;script type="text/javascript" src="https://static
-content-qas.vnforapps.com/v2/js/checkout.js"
data-sessiontoken="67cf73735f83590eabf1382ff49e5e
08b261976326c6897cb764fd160a15a8ca"
data-channel="web"
data-merchantid="341198210"
data-purchasenumber=2020100901
data-amount=100.0
data-expirationminutes="20"
data-timeouturl="about:blank"
data-merchantlogo="img/comercio.png"
data-formbuttoncolor="#000000"
/&gt;
&lt;/form&gt;

</code>
            </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Opción 2</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="codeAcordeon">
            <pre><code class="language-html">

&lt;script type="text/javascript" src="https://static
-content-qas.vnforapps.com/v2/js/checkout.js"/&gt;

&lt;script type="text/javascript"&gt;
function openForm() {
VisanetCheckout.configure({
sessiontoken:'67cf73735f83590eabf1382ff49e5
e08b261976326c6897cb764fd160a15a8ca',
channel:'web',
merchantid:'341198210',
purchasenumber:2020100901,
amount:100.0,
expirationminutes:'20',
timeouturl:'about:blank',
merchantlogo:'img/comercio.png',
formbuttoncolor:'#000000',
action:'paginaRespuesta',
complete: function(params) {
alert(JSON.stringify(params));
}
});
VisanetCheckout.open();
}
&lt;/script&gt;

&lt;html&gt;
&lt;body&gt;
&lt;div&gt;
&lt;button onclick="openForm();"&gt;Pagar&lt;/button&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

</code>
      </pre>
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Puntos BBVA</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas.png"
              alt=""
            />
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas_2.png"
              alt=""
            />
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas_3.png"
              alt=""
            />
          </div>
        </div>

        <h3>Configuración Millas IBK</h3>
        <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas.png"
              alt=""
            />
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas_ibk_2.png"
              alt=""
            />
          </div>
          <div class="imageAcordeon">
            <img
              src="https://web-developer-static.s3.amazonaws.com/Soluciones/CasosdeUso/pagoweb/botonpago/pago_millas_ibk_3.png"
              alt=""
            />
          </div>
        </div>
      </ol>
    </div>

  </div>
</div>

<div id="pagoYape" class="overlay">
    <div class="popup-caso-uso">
      <h2>Pago con Yape</h2>
      <hr />
      <a class="close0" href="#catact">&times;</a>
      <div class="content0">
        <ol>
          <h3>Con Pago con Yape</h3>
          Si el comercio tiene habilitada la opcion Pago con Yape se mostrará la
          siguiente pantalla para seleccionar el medio de pago.
          <br />
          <div
            id="steptrama1-regular-opcion1-paso3"
            class="borderContentTabCeleste stepTrama workBreak"
            style="display: block"
          >

            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/Plugins/CSS/ImgYape/Yape%201.svg"
                alt=""
              />
            </div>
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/Plugins/CSS/ImgYape/Yape%202.svg"
                alt=""
              />
            </div>
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/Plugins/CSS/ImgYape/Yape%203.svg"
                alt=""
              />
            </div>
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/Plugins/CSS/ImgYape/Yape%204.svg"
                alt=""
              />
            </div>
          </div>


          <h3>Trama de Respuesta</h3>

En la trama de respuesta que recibe el comercio de la respuesta del API de autorizacion, recibira el campo Yape_ID como informativo.
El detalle se encuentra en la seccion D
D.1 Tabla de campos

              </pre>
            </div>

          </div>

        </ol>
      </div>
    </div>

  </div>

<div id="pagoCuotealo" class="overlay">
    <div class="popup-caso-uso">
      <h2>Pago con Cuotéalo BCP</h2>
      <hr />
      <a class="close0" href="#catact">&times;</a>
      <div class="content0">
        <ol>
          <h3>¿Cómo funciona?</h3>
          1. Al seleccionar Cuotéalo como método de pago y darle click a Pagar con Cuotéalo se 
          realiza una redirección hacia la Landing Web de Cuotéalo sobre la misma pestaña del 
          navegador.
          <br />
          <div
            id="steptrama1-regular-opcion1-paso3"
            class="borderContentTabCeleste stepTrama workBreak"
            style="display: block"
          >

            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/Cuotealo_IMG_1.png"
                alt=""
              />
            </div>
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/Cuotealo_IMG_2.png"
                alt=""
              />
            </div>

          </div>

          <br />

          2. Dentro de la Landing web de Cuotéalo, el cliente se autentica con las credenciales de
          su banca por internet BCP y se realiza la evaluación sobre el crédito solicitado y se
          indica si fue aprobado o denegado, y redirecciona la respuesta hacia Niubiz.
          <br />
          <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >

          <div class="imageAcordeon">
            <img
              src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/Cuotealo_IMG_3.png"
              alt=""
            />
          </div>

        </div>

        <br />

            3. Niubiz recibe la respuesta de Cuotéalo BCP en una “landing intermedia”, que se mostrará durante unos
            segundos mientras se realiza la redirección nuevamente a la página web del comercio* con el transaction
            token para que el comercio llame a la autorización y tenga la respuesta de dicha transacción.
          <br />
          <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >



          <div class="imageAcordeon">
            <img
              src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/Cuotealo_IMG_4.png"
              alt=""
            />
          </div>

        </div>

        <h3></h3>
        <h3>*CONSIDERACIONES</h3>

        1. Por la dinámica de redireccionamientos explicada previamente. Para el correcto
        funcionamiento de Cuotéalo es indispensable que:
        <br />

        - La URL enviada en el campo action debe ser una URL completa, y no solo un path.
        <br />

        - Dentro de la URL enviada en el campo action, se debe colocar un identificador de
         sesión*, que permita al comercio recuperar la sesión luego de la redirección y relacionarla
          a la transacción original.
          <br />

          (*Ver apartado 3. Configurar el botón de Pago Web – sección C. Request)
          <br />

        2. En la trama de respuesta de la autorización, para las transacciones de cuotéalo,
        siempre se enviará el valor “0000008” en el Terminal.
        <br />

        (Ver apartado D2. Trama de ejemplo)


              </pre>
            </div>

          </div>

        </ol>
      </div>

<div id="pagoPlin" class="overlay">
    <div class="popup-caso-uso">
      <h2>Pago con Plin</h2>
      <hr />
      <a class="close0" href="#catact">&times;</a>
      <div class="content0">
        <ol>
          <h3>¿Cómo funciona?</h3>
          1. Al seleccionar Plin como método de pago y darle click a “Pago con Plin”. El usuario ingresa el número de teléfono y selecciona el Banco desde el que desea Plinear. Da clic en “Plinear”.
          <br />
          <div
            id="steptrama1-regular-opcion1-paso3"
            class="borderContentTabCeleste stepTrama workBreak"
            style="display: block"
          >
            <div class="image-row">
              <div class="imageAcordeon">
                <img
                  src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/Boton1.png"
                  alt=""
                />
              </div>
              <div class="imageAcordeon">
                <img
                  src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/Boton2.png"
                  alt=""
                />
              </div>
              <div class="imageAcordeon">
                <img
                  src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/Boton3.png"
                  alt=""
                />
              </div>
            </div>

          </div>

          <br />

          2. Le llegará una notificación a su App bancaria para confirmar el pago. Tiene 3 minutos para pagar. Confirma el Pago desde el  App del Banco y  el usuario debe volver a la web del comercio para que se complete el flujo de la transacción.
          <br />
          <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >

          <div class="imageAcordeon" style="width: 100%;">
            <img
              src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/PlinIBK.png"
              alt=""
              style="width: 100%; height: auto;"
            />
          </div>

        </div>

        <br />

            3. Mientras el usuario realiza el pago en su app bancario, se mostrará una pantalla de espera (tiene 3 minutos para realizar el pago) , una vez realizado el pago aparece la pantalla de procesar pago. El usuario debe regresar a la pantalla del comercio para finalizar el flujo de la transacción y el comercio sea notificado.
          <br />
          <div
          id="steptrama1-regular-opcion1-paso3"
          class="borderContentTabCeleste stepTrama workBreak"
          style="display: block"
        >
          <div class="image-row">
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/Boton4.png"
                alt=""
              />
            </div>
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/Boton5.png"
                alt=""
              />
            </div>
            <div class="imageAcordeon">
              <img
                src="https://s3-gestor-librerias.s3.amazonaws.com/ImagenesWebDesarrolladores/PLIN/Boton6.png"
                alt=""
              />
            </div>
          </div>

        </div>

        <h3></h3>
        <h3>*CONSIDERACIONES</h3>

        <p>
    <strong>1. Por realizarse el pago de la transacción en el app del cliente y no en el mismo formulario, explicada previamente. Para el correcto funcionamiento de Plin es indispensable que:</strong><br>
    - La URL enviada en el campo <strong>action</strong> debe ser una URL completa, y no solo un path.

</p>

<p>

    Dentro de la URL enviada en el campo <strong>action</strong>, se debe colocar un
    <u>identificador de sesión*</u>

</p>

<p>

    Ejemplo:
    <a href="https://www.dominio.com/paginaRespuesta?id=987978979&WebSessionID=12340201">

        https://www.dominio.com/paginaRespuesta?id=987978979&amp;WebSessionID=12340201
    </a>

</p>

<p>
    <em>(*Ver apartado 3. Configurar el botón de Pago Web – sección C. Request)</em>
</p>

<p>
    <strong>2. En la trama de respuesta de la autorización, para las transacciones de Plin, siempre se enviará el valor “0PLINECO” en el Terminal.</strong><br>
    <em>(Ver apartado D2. Trama de ejemplo)</em>
</p>

<p>
    <strong>3. Si deseas realizar las pruebas de integración de Plin en el Botón de Pago, utiliza los siguientes endpoints del ambiente QA:</strong>
</p>

<ul>
    <li>

        API de Seguridad:
        <a href="https://apiqas.vnforappstest.com/api.security/v1/security">

            https://apiqas.vnforappstest.com/api.security/v1/security
        </a>
    </li>

    <li>

        API de Sesión:
        <a href="https://apiqas.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session">

            https://apiqas.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session
        </a>
    </li>

    <li>

        JavaScript (JS) del Botón de Pago:
        <a href="https://static-content-qas.vnforapps.com/env/qa/js/checkout.js">

            https://static-content-qas.vnforapps.com/env/qa/js/checkout.js
        </a>
    </li>

    <li>

        API de Autorización:
        <a href="https://apiqas.vnforappstest.com/api.authorization/v3/authorization/ecommerce/{merchantId}">

            https://apiqas.vnforappstest.com/api.authorization/v3/authorization/ecommerce/{merchantId}
        </a>
    </li>

</ul>

<p>
    <strong>Código de comercio para pruebas:</strong> 341198210
</p>

<p>
    <strong>Credenciales:</strong>
    integraciones.visanet@necomplus.com / d5e7nk$M
</p>

<p>
    <strong>Para realizar el flujo completo con el pago de la orden es necesario coordinar con el equipo de integraciones</strong>
    (cpalomino@niubiz.com.pe, rberetta@niubiz.com.pe e integraciones_online@niubiz.com.pe),
    de lo contrario no va haber respuesta del API.
</p>

<p>
    <strong>Importante:</strong>
</p>

<p>

    Estos datos corresponden exclusivamente al ambiente de pruebas (QA).
    No deben utilizarse en producción.

</p>

<p>
    <strong>Celulares:</strong><br>
    SKB: 909090903<br>
    BBVA: 973191711 / 969445566<br>
    IBK: 951345765
</p>

<p>
    <strong>Para la prueba es necesario coordinar y enviar un correo a</strong>
    cpalomino@niubiz.com.pe, rberetta@niubiz.com.pe e
    integraciones_online@niubiz.com.pe,
    con copia a tu KAM asignado para poder realizar las validaciones.
</p>

        </ol>
      </div>

    </div>

  </div>
`}</HTMLBlock>

**D. Response**

- **D.1 Tabla de Campos:**<br />TRAMA EXITOSA

<Table align={["left","left","left","left","left"]}>
  <thead>
    <tr>
      <th>
        Campo
      </th>

      <th>
        Tipo
      </th>

      <th>
        Longitud
      </th>

      <th>
        Obligatorio
      </th>

      <th>
        Descripción
      </th>
    </tr>

  </thead>

  <tbody>
    <tr>
      <td>
        transactionToken
      </td>

      <td>
        Texto
      </td>

      <td>
        32
      </td>

      <td>
        **SI**
      </td>

      <td>
        Token que retorna el formulario de pagos luego que el cliente da click en “Pagar”.<br />Si el método de pago fue PagoEfectivo, el valor que retorna es el código CIP.
      </td>
    </tr>

    <tr>
      <td>
        customerEmail
      </td>

      <td>
        Texto
      </td>

      <td>
        Max 25
      </td>

      <td>
        **SI**
      </td>

      <td>
        Correo electrónico del titular de la venta.
      </td>
    </tr>

    <tr>
      <td>
        channel
      </td>

      <td>
        Texto
      </td>

      <td>
        Max 45
      </td>

      <td>
        **SI**
      </td>

      <td>
        Canal de registro. Para pagos con tarjetas, billeteras electrónicas y puntos, retorna el valor: **"web"**.

        Solo si retorna el valor **"pagoefectivo"**, ya no se debe ir al paso **4**. La transacción finalizó con el código CIP que retorna en el campo transactionToken.
      </td>
    </tr>

    <tr>
      <td>
        url
      </td>

      <td>
        Texto
      </td>

      <td>
        Max 500
      </td>

      <td>
        Condicional
      </td>

      <td>
        URL relacionada al pago con PagoEfectivo.<br />Este campo solo se retorna si el método de pago fue PagoEfectivo.
      </td>
    </tr>

  </tbody>
</Table>

TRAMA ERROR

| Campo       | Tipo  | Longitud | Obligatorio | Descripción                                                                                                                                           |
| :---------- | :---- | :------- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| description | Texto | Max 500  | **SI**      | Se enviará un mensaje. Los posibles casos son:<br />transactionToken NOT FOUND<br />customerEmail NOT FOUND<br />channel NOT FOUND<br />url NOT FOUND |

- **D.2 Ejemplos**

```json Caso Exitoso con Tarjeta
transactionToken: 99E9BF92C69A4799A9BF92C69AF79979
customerEmail: integraciones@niubiz.com.pe
channel: web
```

```json Caso Exitoso con PagoEfectivo
transactionToken: 2457C6ABF5AE4D0397C6ABF5AE5D035C
channel: pagoefectivo
url: https://pagoefectivo.com/url/88080
customerEmail: prueba@niubiz.com.pe
```

```json Caso con Error
Error
AMOUNT does not match
```

### 4️⃣ Solicitar autorización de transacción

**A. Descripción y consideraciones**

El paso final de la integración es solicitar la autorización de la transacción. Para que este proceso se pueda ejecutar es necesario contar con un token de acceso válido.

**B. Endpoint**

<HTMLBlock>{`
<div class="rdmd-table">
<div class="rdmd-table-inner container-table-standar scroll-responsive">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Ambiente</th>
                    <th class="text-center">URL API</th> 
                </tr>
                </thead>
                <tbody> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Sandbox</td> 
                    <td class="borderBottom" style="width:300px; color: #03a9f4">https://apisandbox.vnforappstest.com/api.authorization/v3/authorization/ecommerce/{merchantId}</td>
                </tr> 
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">Producción</td> 
                    <td class="borderBottom" style="width:300px; color: #03a9f4">https://apiprod.vnforapps.com/api.authorization/v3/authorization/ecommerce/{merchantId}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
</div>
`}</HTMLBlock>

**C. Request y casos**

- **C.1 Tabla de Campos:**

<HTMLBlock>{`
<div class="rdmd-table-large">
   <div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
      <table class="tableBlueDocs">
         <thead>
            <tr>
               <th class="borderLeft text-center">Campo</th>
               <th class="text-center">Tipo</th>
               <th class="text-center">Longitud</th>
               <th class="text-center">Obligatorio</th>
               <th class="borderRight text-center">Descripción</th>
            </tr>
         </thead>
         <tbody>
            <tr>
               <td colspan="5" class="text-center" style="background-color:#03a9f4; color:white; text-align:center">PATH</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">merchantId</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">9</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Código de comercio creado al momento de la afiliación</td>
            </tr>
            <tr>
               <td colspan="5" class="text-center" style="background-color:#03a9f4; color:white; text-align:center">HEADER</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">Authorization</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 1000</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Access Token generado en el Api de Seguridad
               </td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">Content-Type</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom"></td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Propiedad de header usada para indicar el  media type del recurso.
                  </br>Valor asignado: application/json
               </td>
            </tr>
            <tr>
               <td colspan="5" class="text-center" style="background-color:#03a9f4; color:white; text-align:center">BODY</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">channel</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 45</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Canal de registro. Valor por defecto: “web”</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">captureType</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 45</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Constante, siempre es el valor “manual”</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">countable</td>
               <td class="borderBottom">Bandera</td>
               <td class="borderBottom">–</td>
               <td class="borderBottom">SI</td>
               <td class="borderBottom" style="width:300px">
                  Este campo indica el tipo de liquidación que tendrán tus transacciones:
                  <ul>
                     <li>Liquidación automática: Enviar el valor “true”. Aplica si tu negocio, no necesita confirmar el pago en un segundo paso. Niubiz liquidará automáticamente tu transacción, sin necesidad de que integres un servicio adicional.</li>
                     <li>Liquidación manual: Enviar el valor “false”. Aplica si tu negocio, necesita confirmar el pago en un segundo paso. En este caso, es obligatorio que integres la API de confirmación.</li>
                  </ul>
               </td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">order</td>
               <td class="borderBottom"></td>
               <td class="borderBottom"></td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Objeto orden</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">tokenId</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">32</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Token retornado del formulario de pagos</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">purchaseNumber</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 12</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Número de Pedido, este valor debe ser creado por el
                  comercio y es único por intento de autorización
               </td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">amount</td>
               <td class="borderBottom">Numérico</td>
               <td class="borderBottom">6,2</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Importe de la transacción. Formato ####.## (Dos
                  decimales
                  separados por punto) Ejemplo: 1000.00<br>
                  Se recomienda como buena práctica la validación del monto autorizado
                  (este campo) con respecto al que fue enviado inicialmente.
               </td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">currency</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">3</td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Código de moneda (ISO 4217) utilizado en la transacción. Ejemplo: PEN y USD
               </td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">dataMap</td>
               <td class="borderBottom"></td>
               <td class="borderBottom"></td>
               <td class="borderBottom"><b>SI</b></td>
               <td class="borderBottom" style="width:300px">Objeto Datos Adicionales</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">urlAddress</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 255</td>
               <td class="borderBottom">SI</td>
               <td class="borderBottom">URL del Sitio Web del Comercio</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">partnerIdCode</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 6</td>
               <td class="borderBottom">NO</td>
               <td class="borderBottom">Codigo que representa un acuerdo comercial entre el Banco y el Comercio. El codigo es proporcionado por el Emisor</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">serviceLocationCityName</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 50</td>
               <td class="borderBottom">SI</td>
               <td class="borderBottom">Ciudad o Distrito donde se encuentra la persona que realiza la compra. En su defecto utilizar la Ciudad/Distrito de Envío o la del Comercio</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">serviceLocationCountrySubdivisionCode</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 3</td>
               <td class="borderBottom">SI</td>
               <td class="borderBottom">Departamento o Provincia donde se encuentra la persona que realiza la compra. En su defecto utilizar el Departamento/Provincia de Envío o la del Comercio. Se debe enviar en formato ISO 3166-2</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">serviceLocationCountryCode</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 3</td>
               <td class="borderBottom">SI</td>
               <td class="borderBottom">País donde se encuentra la persona que realiza la compra. En su defecto utilizar el País de Envío o la del Comercio. Se debe enviar en formato ISO 3166-1 alpha-3</td>
            </tr>
            <tr class="text-center content-td-table-st">
               <td class="borderBottom">serviceLocationPostalCode</td>
               <td class="borderBottom">Texto</td>
               <td class="borderBottom">Max 10</td>
               <td class="borderBottom">SI</td>
               <td class="borderBottom">Codigo Postal donde se encuentra la persona que realiza la compra. En su defecto utilizar el Codigo Postal de Envío o la del Comercio</td>
            </tr>
         </tbody>
      </table>
   </div>
</div>
`}</HTMLBlock>

- **C.1 Trama de ejemplo:**

```json Request
POST /api.authorization/v3/authorization/ecommerce/456879852 HTTP/1.1
Host: apisandbox.vnforappstest.com
Content-Type: application/json
Authorization: eyJraWQiOiJmWk1tV3pZR0RBckxHektvalNCK2w3SjFhMnNPXC9zQnNwOTlNN mNuM3F5MD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkMTlhM2I0Zi01NzYxLTRlYTEtYjBmYS1i NWNiNjU5OWQ5NWQiLCJjb2duaXRvOmdyb3VwcyI6WyJjdXN0b2RpbyJdLCJldmVudF9pZCI6ImM2 OTZmZjVkLTZjOTctNDE4NC05MGIxLTA5NjM2MWY4M2E2ZSIsInRva2VuX3VzZSI6ImFjY2VzcyIs InNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MDIx MTM4NzksImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNv bVwvdXMtZWFzdC0xXzJjSjFTZTFmSSIsImV4cCI6MTYwMjExNzQ3OSwiaWF0IjoxNjAyMTEzODc5 LCJqdGkiOiJiOTVmOGU0ZS1kZGE4LTRkZmUtOTc0NC1kOGQwZGEyMDFlMzMiLCJjbGllbnRfaWQi OiIxMGx2MDYxN281ZGljNTFlYnNucWVpaWpiNyIsInVzZXJuYW1lIjoiZ2lhbmNhZ2FsbGFyZG9A Z21haWwuY29tIn0.GrO2XLoMnChN3Dg6H8G7LC3ZY4O_c1-DwvRYHCx8iiDqprFMK7jU43vo6W4I LNqP_QA1sDoEQaD9HJJ7iLfVBojh1tgiFyzFzkX4T3m63eHRSFfIZAToTGYOQoeZchsYb3UAffvr zR1JlUPjwf3U1YRfBEu8ueIR6_OUMZdXC8TLS3pqEpXnPr6S-_bndpFRs5wZpt0BPSJ4OnhM2AYh 6pqFucjL9nsPmIaujJQVwdR8oNcrfeFuIv5t55H_DRDpQCSYstac1nFSm00P3EMdbOX6Lh8dTU5d BOXe17Bfh7mDEP-FnF_J47COVFB_sYh7JXyePfK6kKTlSeV0Ev0pew
{
"channel": "web",
"captureType": "manual",
"countable": true,
"order" : {
"tokenId": "99E9BF92C69A4799A9BF92C69AF79979",
"purchaseNumber": 2020100901,
"amount": 10.5,
"currency": "PEN"
}
}
```

**D. Response**

- **D.1 Tabla de Campos:**

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
            <table class="tableBlueDocs">
                <thead>
                <tr>
                    <th class="borderLeft text-center">Campo</th>
                    <th class="text-center">Tipo</th>
                    <th class="text-center">Longitud</th>
                    <th class="text-center">Obligatorio</th>
                    <th class="borderRight text-center">Descripción</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; color:white; text-align:center">TRAMA EXITOSA:
                        200
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">header</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Objeto header</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ecoreTransactionUUID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">36</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Identificador único de transacción para la plataforma
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ecoreTransactionDate</td>
                    <td class="borderBottom">Fecha</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Fecha de la transacción expresada en formato UNIX
                        TimeStamp
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">millis</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Tiempo de ejecución de la transacción</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">fulfillment</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Objeto fulfillment</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">channel</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 45</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Canal de registro. Valor por defecto: “web”</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">merchantId</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">9</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de comercio creado al momento de la afiliación
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">terminalId</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 8</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Número de terminal asociado a la transacción</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">captureType</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 45</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Constante, siempre es el valor “manual”</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">countable</td>
                    <td class="borderBottom">Bandera</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                        Este campo indica si la venta a realizar tendrá liquidación automática o manual. Acepta los
                        siguientes valores:
                        true – Para liquidación automática<br>
                        false – Para liquidación manual<br>
                        Valor por defecto: Según configuración del comercio en BackOffice Niubiz
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">fastPayment</td>
                    <td class="borderBottom">Bandera</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                        Este campo indica si la venta se realizó con indicador activo de pago rápido. Acepta los
                        siguientes
                        valores:<br>
                        true – Venta es tipo pago rápido<br>
                        false – Venta no es tipo pago rápido
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">signature</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">36</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código único generado por el sistema Niubiz al momento
                        de
                        la venta
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">order</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Objeto order</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">tokenId</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">32</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Token retornado del formulario de pagos</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">purchaseNumber</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 12</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Número de Pedido, este valor debe ser creado por el
                        comercio y es único por intento de autorización
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">amount</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Importe de la transacción. Formato ####.## (Dos
                        decimales
                        separados por punto) Ejemplo: 1000.00<br>
                        Se recomienda como buena práctica la validación del monto autorizado
                        (este campo) con respecto al que fue enviado inicialmente.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">installment</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Número de cuotas en que se realizó el pago</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">currency</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">3</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de moneda (ISO 4217) utilizado en la transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">authorizedAmount</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Importe del pedido confirmado</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">authorizationCode</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 6</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de autorización asignado a la aprobación de la
                        transacción por la entidad resolutora
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">actionCode</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">3</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código que identifica la acción a tomar o tomada, así
                        como
                        la razón de la misma. Define la respuesta a la petición de autorización realizada
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">traceNumber</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 6</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Número asignado para identificar de forma unívoca a la
                        transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">transactionDate</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">12</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Fecha de la transacción expresada en formato nativo
                        yyMMddHHmmSS
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">transactionId</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">15</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Identificador de la transacción asociado a la
                        autorización
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">token</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Objeto token, el cual contiene información relacionada
                        a la
                        tokenización de la tarjeta utilizada
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">tokenId</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">16</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Token identificador del objeto tokenizado</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ownerId</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 100</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Valor del campo por el cual se tokenizo la tarjeta</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">expireOn</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">12</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Fecha de caducidad del token expresado en formato
                        nativo
                        yyMMddHHmmSS
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">dataMap</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Objeto datamap</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">CURRENCY</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">4</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código numérico de moneda en la que se ejecuta la
                        transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">TERMINAL</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">8</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Número de terminal asociado a la transacción</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">TRANSACTION_DATE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">12</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Fecha de la transacción expresada en formato nativo
                        yyMMddHHmmSS
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ACTION_CODE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">3</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Para transacciones autorizadas se retorna “000” o “010”.
                      <br>Para transacción rechazadas, se retorna el código de acción asociado al motivo de rechazo.
                      <br>Puedes ver el listado de códigos de acción: 
                      <a href="https://desarrolladores.niubiz.com.pe/v1.1/docs/c%C3%B3digos-de-respuesta">aquí</a>.

                  </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">TRACE_NUMBER</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 6</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Número asignado para identificar de forma unívoca a la
                        transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">CARD_TOKEN</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">16</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Token identificador del objeto tokenizado</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">CARD_TYPE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">1</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Tipo de tarjeta usada en la transacción. Acepta los
                        siguientes valores:
                        C – Tarjeta de crédito<br>
                        D – Tarjeta de débito<br>
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ECI_DESCRIPTION</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 100</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Descripción del código ECI asociado a la autenticación
                        de
                        la transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ECI</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">2</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Código ECI asociado a la autenticación de la transacción.
                      <br>Puedes ver el listado de códigos ECI
                      <a href="https://desarrolladores.niubiz.com.pe/v1.1/docs/c%C3%B3digos-de-respuesta-eci">aquí</a>.
                  </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">SIGNATURE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">36</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código único generado por el sistema Niubiz al momento
                        de
                        la venta
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">CARD</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 16</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Número de tarjeta enmascarado o token de marca usada en la venta</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">MERCHANT</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">9</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de comercio creado al momento de la afiliación
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">BRAND</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 15</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Marca de la tarjeta usada en la venta. Ejemplo:<br>
                        Visa<br>
                        Mastercard<br>
                        Amex<br>
                        Diners Club<br>
                        Pagoefectivo<br>
                      	Union Pay
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">STATUS</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 20</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">
                      Descripción del estado de la transacción. Ejemplo:
    										<br>Authorized
    										<br>Not Authorized
    										<br>Voided
    										<br>Not Voided
    										<br>Este campo se debe tomar para evaluar el resultado de la transacción. Solamente si el “STATUS”: “Authorized”, se puede considerar que la venta fue exitosa.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">INSTALLMENTS_INFO</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">11</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Información relacionada a las cuotas de la
                        transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ACTION_DESCRIPTION</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 100</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Texto descriptivo de la autorización o detalle del motivo de la denegación.</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ADQUIRENTE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 6</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de identificación del adquirente</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_AMOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Importe aproximado del valor de cuota</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ID_UNICO</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">16</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Identificador de la transacción asociado a la
                        autorización
                    </td>

                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">AMOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Importe de la transacción. Formato ####.## (Dos
                        decimales
                        separados por punto) Ejemplo: 1000.00<br>
                        Se recomienda como buena práctica
                        la validación del monto autorizado
                        (este campo) con respecto al que fue
                        enviado inicialmente.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">PROCESS_CODE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">6</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de proceso de la transacción</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_NUMBER</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Número de cuotas en que se realizó la venta</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">VAULT_BLOCK</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 100</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Valor del campo por el cual se tokenizo la tarjeta</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">TRANSACTION_ID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">16</td>
                    <td class="borderBottom">SI</td>
                    <td class="borderBottom" style="width:300px">Identificador de la transacción asociado a la
                        autorización
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">AUTHORIZATION_CODE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 6</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de autorización asignado a la aprobación de la
                        transacción por la entidad resolutora
                    </td>
                </tr>
                                 <tr class="text-center content-td-table-st">
                    <td class="borderBottom">YAPE_ID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">20</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Identificador único de la intención de pago en Yape. Checkout como informativo.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_DEFERRED</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">
                        Indica si el pago en cuotas debe procesarse con pagos en diferido. Acepta los siguientes
                        valores:<br>
                        0 – El pago no se procesa en diferido<br>
                        1 o 2 – El pago se procesa en diferido
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_NI_PROGRAM</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Código de programa para cuota sin intereses</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_NI_TYPE</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">
                        Indicador de tipo de cobro para cuotas sin intereses. Acepta los siguientes valores:<br>
                        0 – Cobro como porcentaje<br>
                        1 – Cobro como importe
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_NI_AMOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Valor asociado al tipo de cobro para cuotas sin
                        intereses
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_NI_DISCOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Porcentaje de descuento que corresponde al emisor por
                        el
                        programa cuota sin intereses
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">QUOTA_NI_MESSAGE</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 100</td>
                    <td class="borderBottom">Condicional</td>
                    <td class="borderBottom" style="width:300px">Mensaje asociado al cobro para cuota sin intereses</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">CVV2_VALIDATION_RESULT</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">1</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Resultado de verificación del CVV2 de la tarjeta</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">REDEEMED_EQUIVALENT_AMOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">18,2</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Indica el valor monetario canjeado</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">REDEEMED_POINTS</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">18</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Indica el valor de puntos canjeado</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_ID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">250</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Identificador de la transacción de puntos</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_TOTAL_AMOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">18,2</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Monto de la transacción completo (puntos +
                        financiero)
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_MERCHANT_ID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">10</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Identificador del código de comercio utilizado en el
                        canje de puntos
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_TRACE_ID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">50</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Trace de la operación de puntos</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_STATUS</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">50</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Estado de la operación de puntos (Accepted / Denied)
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_PROGRAM_NAME</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">250</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Nombre del programa de puntos utilizado</td>
                </tr>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; color:white; text-align:center">TRAMA ERROR:
                        400
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">errorCode</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de error</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">errorMessage</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 500</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Descripción del error</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">header</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Objeto header</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ecoreTransactionUUID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">36</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Identificador único de transacción para la plataforma
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">ecoreTransactionDate</td>
                    <td class="borderBottom">Fecha</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Fecha de la transacción expresada en formato UNIX
                        TimeStamp
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">millis</td>
                    <td class="borderBottom">Entero</td>
                    <td class="borderBottom">–</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Tiempo de ejecución de la transacción</td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">data</td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"></td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Objeto con información complementaria relacionada al
                        error
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">CURRENCY</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">4</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código numérico de moneda en la que se ejecuta la
                        transacción
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">AMOUNT</td>
                    <td class="borderBottom">Numérico</td>
                    <td class="borderBottom">6,2</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Importe de la transacción. Formato ####.## (Dos
                        decimales
                        separados por punto) Ejemplo: 1000.00<br>
                        Se recomienda como buena práctica
                        la validación del monto autorizado
                        (este campo) con respecto al que fue
                        enviado inicialmente.
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">MERCHANT</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">9</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Código de comercio creado al momento de la afiliación
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_ID</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">250</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Identificador de la transacción de puntos
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">EXCHANGE_STATUS</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">50</td>
                    <td class="borderBottom">NO</td>
                    <td class="borderBottom" style="width:300px">Estado de la operación de puntos (Accepted / Denied)
                    </td>
                </tr>
                <tr>
                    <td colspan="5" class="text-center" style="background-color:#03a9f4; color:white; text-align:center">TRAMA ERROR:
                        401,
                        406 Y 500
                    </td>
                </tr>
                <tr class="text-center content-td-table-st">
                    <td class="borderBottom">description</td>
                    <td class="borderBottom">Texto</td>
                    <td class="borderBottom">Max 1000</td>
                    <td class="borderBottom"><b>SI</b></td>
                    <td class="borderBottom" style="width:300px">Descripción relacionada al error</td>
                </tr>
                </tbody>
            </table>

</div></div>
`}</HTMLBlock>

- **D.2 Trama de ejemplo:**

```json Caso 200
Status Code 200 OK
Content-Type: application/json
{
  "header": {
    "ecoreTransactionUUID": "82c8c69b-0bdc-4bde-bdaf-2cd05880656c",
    "ecoreTransactionDate": 1721769585121,
    "millis": 1851
  },
  "fulfillment": {
    "channel": "web",
    "merchantId": "456879852",
    "terminalId": "00000001",
    "captureType": "manual",
    "countable": true,
    "fastPayment": false,
    "signature": "82c8c69b-0bdc-4bde-bdaf-2cd05880656c"
  },
  "order": {
    "tokenId": "9643804446A649A583804446A6C9A5A3",
    "purchaseNumber": "50006259",
    "amount": 1,
    "installment": 0,
    "currency": "PEN",
    "externalTransactionId": "GP4235",
    "authorizedAmount": 1,
    "authorizationCode": "226282",
    "actionCode": "000",
    "traceNumber": "518938",
    "transactionDate": "240723161943",
    "transactionId": "996242054977168"
  },
  "dataMap": {
    "TERMINAL": "00000001",
    "BRAND_ACTION_CODE": "00",
    "BRAND_HOST_DATE_TIME": "240723161943",
    "TRACE_NUMBER": "518938",
    "CARD_TYPE": "D",
    "ECI_DESCRIPTION": "Transaccion no autenticada pero enviada en canal seguro",
    "SIGNATURE": "82c8c69b-0bdc-4bde-bdaf-2cd05880656c",
    "CARD": "455788******1119",
    "MERCHANT": " 456879852",
    "STATUS": "Authorized",
    "ACTION_DESCRIPTION": "Aprobado y completado con exito",
    "ID_UNICO": "996242054977168",
    "AMOUNT": "1.00",
    "BRAND_HOST_ID": "239879",
    "AUTHORIZATION_CODE": "226282",
    "YAPE_ID": "",
    "CURRENCY": "0604",
    "TRANSACTION_DATE": "240723161943",
    "ACTION_CODE": "000",
    "CVV2_VALIDATION_RESULT": "M",
    "ECI": "07",
    "ID_RESOLUTOR": "584205767842630",
    "BRAND": "visa",
    "ADQUIRENTE": "570010",
    "BRAND_NAME": "VI",
    "PROCESS_CODE": "000000",
    "TRANSACTION_ID": "996242054977168"
  }
}
```

```json Caso 200 - Pago con Yape
Status Code 200 OK
Content-Type: application/json
{
 "header": {
 "ecoreTransactionUUID": "2e2cba40-a914-4e79-b4d3-8a2f2737eb73",
 "ecoreTransactionDate": 1.602369270919E12,
 "millis": 5064.0
 },
  "fulfillment": {
  "channel": "web",
  "merchantId": "341198210",
  "terminalId": "1",
  "captureType": "manual",
  "countable": true,
  "fastPayment": false,
  "signature": "2e2cba40-a914-4e79-b4d3-8a2f2737eb73"
 },
  "order": {
  "tokenId": "99E9BF92C69A4799A9BF92C69AF79979",
  "purchaseNumber": "2020100901",
  "amount": 10.5,
  "installment": 2,
  "currency": "PEN",
  "authorizedAmount": 10.5,
  "authorizationCode": "173424",
  "actionCode": "000",
  "traceNumber": "177159",
  "transactionDate": "201010173430",
    "transactionId": "0993202840246052"
  },
  "token": {
    "tokenId": "7000010038706267",
    "ownerId": "jperez@latinmail.com",
    "expireOn": "240702123548"
  },
  "dataMap": {
    "TERMINAL": "00000001",
    "TRACE_NUMBER": "177159",
    "ECI_DESCRIPTION": "Transaccion no autenticada pero enviada en canal seguro",
    "SIGNATURE": "2e2cba40-a914-4e79-b4d3-8a2f2737eb73",
    "CARD": "455170******8329",
    "MERCHANT": "341198210",
    "STATUS": "Authorized",
    "INSTALLMENTS_INFO": "02000000000",
    "ACTION_DESCRIPTION": "Aprobado y completado con exito",
    "ID_UNICO": "0993202840246052",
    "AMOUNT": "10.50",
    "QUOTA_NUMBER": "02",
    "AUTHORIZATION_CODE": "173424",
    "YAPE_ID": "20221111150918776830",
    "CURRENCY": "0604",
    "TRANSACTION_DATE": "201010173430",
    "ACTION_CODE": "000",
    "CARD_TOKEN": "7000010038706267",
    "ECI": "07",
    "BRAND": "visa",
    "ADQUIRENTE": "570002",
    "QUOTA_AMOUNT": "0.00",
    "PROCESS_CODE": "000000",
    "VAULT_BLOCK": "jperez@latinmail.com",
    "TRANSACTION_ID": "0993202840246052",
    "QUOTA_DEFERRED": "0"
  }
}
```

```json Caso 200 - Cuotéalo
Status Code 200 OK
Content-Type: application/json
{
    "header": {
        "ecoreTransactionUUID": "6711c08a-4341-4a68-8533-e888d9b978a6",
        "ecoreTransactionDate": 1744041373585,
        "millis": 1781
    },
    "fulfillment": {
        "channel": "web",
        "merchantId": "760001160",
        "terminalId": "00000008",
        "captureType": "manual",
        "countable": true,
        "fastPayment": false,
        "signature": "6711c08a-4341-4a68-8533-e888d9b978a6"
    },
    "order": {
        "tokenId": "72A84F13EA164B28A84F13EA167B2842",
        "purchaseNumber": "704251",
        "amount": 150,
        "installment": 0,
        "currency": "PEN",
        "authorizedAmount": 150,
        "authorizationCode": "455",
        "actionCode": "000",
        "traceNumber": "455",
        "transactionDate": "250407105613",
        "transactionId": "455788000000455"
    },
    "dataMap": {
        "CURRENCY": "0604",
        "TERMINAL": "00000008",
        "TRANSACTION_DATE": "250407105613",
        "ACTION_CODE": "000",
        "TRACE_NUMBER": "455",
        "CARD_TYPE": "D",
        "ECI_DESCRIPTION": "Transacción no autenticada pero enviada en canal seguro",
        "ECI": "07",
        "SIGNATURE": "6711c08a-4341-4a68-8533-e888d9b978a6",
        "CARD": "808080******0000",
        "MERCHANT": "760001160",
        "BRAND": "visa",
        "STATUS": "Authorized",
        "ACTION_DESCRIPTION": "Aprobado y completado con exito",
        "ADQUIRENTE": "570002",
        "ID_UNICO": "455788000000455",
        "AMOUNT": "150.0",
        "BRAND_NAME": "VI",
        "PROCESS_CODE": "000000",
        "TRANSACTION_ID": "455788000000455",
        "AUTHORIZATION_CODE": "455"
    }
}
```

```json Caso 200 – Pago con Plin​
Status Code 200 OK
Content-Type: application/json

{
  "header": {
    "ecoreTransactionUUID": "6711c08a-4341-4a68-8533-e888d9b978a6",
    "ecoreTransactionDate": 1744041373585,
    "millis": 1781
  },
  "fulfillment": {
    "channel": "web",
    "merchantId": "760001160",
    "terminalId": " 0PLINECO ",
    "captureType": "manual",
    "countable": true,
    "fastPayment": false,
    "signature": "6711c08a-4341-4a68-8533-e888d9b978a6"
  },
  "order": {
    "tokenId": "72A84F13EA164B28A84F13EA167B2842",
    "purchaseNumber": "704251",
    "amount": 150,
    "installment": 0,
    "currency": "PEN",
    "authorizedAmount": 150,
    "authorizationCode": "455",
    "actionCode": "000",
    "traceNumber": "455",
    "transactionDate": "250407105613",
    "transactionId": "455788000000455"
  },
  "dataMap": {
    "CURRENCY": "0604",
    "TERMINAL": " 0PLINECO ",
    "TRANSACTION_DATE": "250407105613",
    "ACTION_CODE": "000",
    "TRACE_NUMBER": "455",
    "CARD_TYPE": "D",
    "ECI_DESCRIPTION": "Transacción no autenticada pero enviada en canal seguro",
    "ECI": "07",
    "SIGNATURE": "6711c08a-4341-4a68-8533-e888d9b978a6",
    "CARD": "808080******0000",
    "MERCHANT": "760001160",
    "BRAND": "visa",
    "STATUS": "Authorized",
    "ACTION_DESCRIPTION": "Aprobado y completado con exito",
    "ADQUIRENTE": "570002",
    "ID_UNICO": "455788000000455",
    "AMOUNT": "150.0",
    "BRAND_NAME": "VI",
    "PROCESS_CODE": "000000",
    "TRANSACTION_ID": "455788000000455",
    "AUTHORIZATION_CODE": "455"
  }
}
```

```json Caso 400
{
    "errorCode": 400,
    "errorMessage": "Not Authorized",
    "header": {
        "ecoreTransactionUUID": "7677a82d-4ae7-4007-9936-386261410eaf",
        "ecoreTransactionDate": 1649281782145,
        "millis": 1806
    },
    "data": {
        "CURRENCY": "0604",
        "TERMINAL": "00000001",
        "TRANSACTION_DATE": "220406164940",
        "BRAND_ACTION_CODE": "N7",
        "BRAND_HOST_DATE_TIME": "220406164940",
        "ACTION_CODE": "129",
        "TRACE_NUMBER": "12967",
        "CVV2_VALIDATION_RESULT": "N",
        "CARD_TYPE": "C",
        "ECI_DESCRIPTION": "Transaccion no autenticada pero enviada en canal seguro",
        "ECI": "07",
        "SIGNATURE": "7677a82d-4ae7-4007-9936-386261410eaf",
        "CARD": "491914******9067",
        "MERCHANT": "341198210",
        "BRAND": "visa",
        "STATUS": "Not Authorized",
        "ACTION_DESCRIPTION": "Tarjeta no operativa",
        "ADQUIRENTE": "570016",
        "ID_UNICO": "996220966728764",
        "AMOUNT": "21.00",
        "BRAND_NAME": "VI",
        "PROCESS_CODE": "000000",
        "BRAND_HOST_ID": "245236",
        "TRANSACTION_ID": "996220966728764"
    }
}
```

```json Caso 401
Status Code 401 Unauthorized
Content-Type: text/plain
Unauthorized Access
```

```json Caso 406
Status Code 406 Not Acceptable
Content-Type: text/plain
Too many request with same payload [Idempotent policy]
```

```json Caso 500
Status Code 500 Internal Server Error
Content-Type: text/plain
```

```json Caso 200 con pago con Puntos
"header": {
"ecoreTransactionUUID": "e55659b9-3960-425c-a9a6-a20c6e327aea",
"ecoreTransactionDate": 1.620319374177E12,
"millis": 1844.0
},
"fulfillment": {
"channel": "web",
"merchantId": "341198052",
"terminalId": "1",
"captureType": "manual",
"countable": true,
"fastPayment": false,
"signature": "e55659b9-3960-425c-a9a6-a20c6e327aea"
},
"order": {
"tokenId": "B070A3CEC4394D89B0A3CEC4399D8968",
"purchaseNumber": "20210506411",
"productId": "170",
"amount": 120.0,
"installment": 0.0,
"currency": "PEN",
"authorizedAmount": 0.0,
"authorizationCode": "150001",
"actionCode": "000",
"traceNumber": "644572",
"transactionDate": "210506114253",
"transactionId": "01620319373000"
  },
  "dataMap": {
    "EXCHANGE_MERCHANT_ID": "341198052",
    "CURRENCY": "0604",
    "TRANSACTION_DATE": "210506114253",
    "ACTION_CODE": "000",
    "TRACE_NUMBER": "644572",
    "REDEEMED_EQUIVALENT_AMOUNT": "120.0",
    "CARD_TYPE": "D",
    "EXCHANGE_TRACE_ID": "000390",
    "REDEEMED_POINTS": "3960",
    "SIGNATURE": "e55659b9-3960-425c-a9a6-a20c6e327aea",
    "EXCHANGE_ID": "vVruvnpAqE3ZXNd3GL3O",
    "BRAND": "visa",
    "MERCHANT": "341198052",
    "EXCHANGE_PROGRAM_NAME": "Puntos Vida BBVA",
    "STATUS": "Authorized",
    "ACTION_DESCRIPTION": "Aprobado y completado con exito",
    "EXCHANGE_TOTAL_AMOUNT": "120.0",
    "ID_UNICO": "01620319373000",
    "AMOUNT": "0.0",
    "TRANSACTION_ID": "01620319373000",
    "EXCHANGE_STATUS": "Accepted",
    "AUTHORIZATION_CODE": "150001",
    "EXCHANGE_TERMINAL_ID": "00000001"
  }
}
```

```json Caso 400 con pago con Puntos
"errorCode": 400.0,
 "errorMessage": "Transaction not voided",
  "header": {
  "ecoreTransactionUUID": "cd84283e-d1b8-4cb4-9cef-d15b854dac34",
  "ecoreTransactionDate": 1.620319180121E12,
  "millis": 2399.0
  },
  "data":{
   "TERMINAL": "00000001",
   "BRAND_ACTION_CODE": "00",
   "BRAND_HOST_DATE_TIME": "210506113855",
   "TRACE_NUMBER": "644559",
   "ECI_DESCRIPTION": "Transaccion no autenticada pero enviada en canal seguro",
   "CARD_TYPE": "D",
   "SIGNATURE": "cd84283e-d1b8-4cb4-9cef-d15b854dac34",
   "EXCHANGE_ID": "GwPk8R4n5wyhBtUlSaaK",
   "CARD": "455103******0515",
   "MERCHANT": "341198052",
   "STATUS": "Not Voided",
   "ACTION_DESCRIPTION": "Problema de comunicacion",
   "ID_UNICO": "994211260004000",
   "AMOUNT": "98.55",
   "BRAND_HOST_ID": "005039",
   "EXCHANGE_STATUS": "Denied",
   "AUTHORIZATION_CODE": "113935",
   "CURRENCY": "0604",
   "TRANSACTION_DATE": "210506113939",
   "ACTION_CODE": "909",
   "ECI": "07",
   "ID_RESOLUTOR": "120210506113935",
   "BRAND": "visa",
   "ADQUIRENTE": "570002",
   "BRAND_NAME": "VI",
   "PROCESS_CODE": "000000",
   "TRANSACTION_ID": "994211260004000"
  }
 }
```

## **Datos de prueba**

<HTMLBlock>{`
<hr>
`}</HTMLBlock>

Te dejamos aquí lo que necesitas para realizar tus pruebas en **sandbox**.

### Código de Comercio

| Comercio  | Moneda  | Tipo de Liquidación             |
| :-------- | :------ | :------------------------------ |
| 456879852 | Soles   | Liquidación automática y manual |
| 456879853 | Dólares | Liquidación automática          |
| 456879854 | Dólares | Liquidación manual              |

#### Códigos de Comercio para Pago con Puntos / Millas

| Código de comercio | Moneda  | Programa de Fidelización |
| :----------------- | :------ | :----------------------- |
| 750000421          | Soles   | Puntos Vida BBVA         |
| 750000423          | Dólares | Puntos Vida BBVA         |

#### Códigos de Comercio para Pago con Yape

| Comercio  | Tipo     |
| :-------- | :------- |
| 456879852 | Yape Web |
| 341198210 | Yape Web |
| 341198214 | Yape Web |

### Credenciales

Las credenciales para ambiente de **sandbox** que debes utilizar, son:

| Usuario                       | Password   |
| :---------------------------- | :--------- |
| <integraciones@niubiz.com.pe> | \_7z3\@8fF |

### Tarjetas de prueba

#### Caso Exitoso

- Visa

| Escenario                             | Número           | Mes/año | CVV | Código de Acción |
| :------------------------------------ | :--------------- | :------ | :-- | :--------------- |
| Venta exitosa – con cuotas            | 4551708161768059 | 03/2028 | 111 | 000              |
| Venta exitosa – sin cuotas            | 4474118355632240 | 03/2028 | 111 | 000              |
| Venta exitosa – foránea               | 4485412049751046 | 03/2028 | 111 | 000              |
| Venta exitosa – afiliación a REC      | 4474104525811674 | 03/2028 | 111 | 000              |
| Venta exitosa – Tokenización de marca | 4140682013946809 | 03/2028 | 111 | 000              |

- Master Card

| Escenario                        | Número           | Mes/año | CVV | Código de Acción |
| :------------------------------- | :--------------- | :------ | :-- | :--------------- |
| Venta exitosa – con cuotas       | 5160030000000317 | 03/2028 | 111 | 000              |
| Venta exitosa – sin cuotas       | 5455460920094260 | 03/2028 | 111 | 000              |
| Venta exitosa – afiliación a REC | 5443599980000447 | 03/2028 | 111 | 000              |

- American Express

| Escenario                  | Número          | Mes/año | CVV | Código de Acción |
| :------------------------- | :-------------- | :------ | :-- | :--------------- |
| Venta exitosa – con cuotas | 371064649323968 | 03/2028 | 111 | 000              |
| Venta exitosa – sin cuotas | 371204534881155 | 03/2028 | 111 | 000              |

- Diners Club

| Escenario                  | Número         | Mes/año | CVV | Código de Acción |
| :------------------------- | :------------- | :------ | :-- | :--------------- |
| Venta exitosa – con cuotas | 36006616055724 | 04/2025 | 111 | 000              |
| Venta exitosa – sin cuotas | 36340477773855 | 04/2025 | 111 | 000              |

- Union Pay

| Escenario                  | Número           | Mes/año | CVV |
| :------------------------- | :--------------- | :------ | :-- |
| Venta exitosa - sin cuotas | 6210945888010005 | 10/2030 | 123 |
| Venta exitosa - foranea    | 6210945888021    | 10/2030 | 123 |

#### Casos denegados

- Visa

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
                    <table class="tableBlueDocs">
                        <thead>
                        <tr>
                            <th class="borderLeft text-center">Escenario</th>
                            <th class="text-center">Número</th>
                            <th class="text-center">Mes/año</th>
                            <th class="text-center">CVV</th>
                            <th class="borderRight text-center">Codigo de Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta vencida</td>
                            <td class="borderBottom">4024007126919058</td>
                            <td class="borderBottom">03/2019</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">101</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Operación no permitida para esta tarjeta</td>
                            <td class="borderBottom">4916122919724598</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">102</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Monto no permitido</td>
                            <td class="borderBottom">4242424242424242</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">113</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Fondos insuficientes</td>
                            <td class="borderBottom">4041650444437904</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">116</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta inválida</td>
                            <td class="borderBottom">4111111111111111</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">118</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no operativa</td>
                            <td class="borderBottom">4534410925317008</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">129</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta inválida</td>
                            <td class="borderBottom">4716883481987333</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">180</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta perdida</td>
                            <td class="borderBottom">4557885040264791</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">208</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta robada</td>
                            <td class="borderBottom">4557883870910971</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">209</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación</td>
                            <td class="borderBottom">4285975261967724</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">666</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción denegada por posible fraude</td>
                            <td class="borderBottom">4551707477308329</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">670</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Error en autenticación</td>
                            <td class="borderBottom">4732453453776393</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">678</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Comercio no válido</td>
                            <td class="borderBottom">4539674409144668</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">754</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Contactar emisor</td>
                            <td class="borderBottom">4539676788512233</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">191</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Afiliación a REC no exitosa</td>
                            <td class="borderBottom">4474103791846547</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">0</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Contactar emisor</td>
                            <td class="borderBottom">4539678262453231</td>
                            <td class="borderBottom">03/2028</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">190</td>
                        </tr>
                        </tbody>
                    </table>
                </div></div>
`}</HTMLBlock>

- Master Card

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
                    <table class="tableBlueDocs">
                        <thead>
                        <tr>
                            <th class="borderLeft text-center">Escenario</th>
                            <th class="text-center">Número</th>
                            <th class="text-center">Mes/año</th>
                            <th class="text-center">CVV</th>
                            <th class="borderRight text-center">Codigo de Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta Vencida</td>
                            <td class="borderBottom">5455450920104193</td>
                            <td class="borderBottom">04/2019</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">101</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Monto no permitido</td>
                            <td class="borderBottom">5101641510088022</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">113</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Fondos insuficientes</td>
                            <td class="borderBottom">5115422225052734</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">116</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no registrada</td>
                            <td class="borderBottom">5109616945811695</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">118</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no operativa (error de CVV)</td>
                            <td class="borderBottom">5111053459429167</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">129</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta inválida</td>
                            <td class="borderBottom">5243798112895755</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">180</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta perdida</td>
                            <td class="borderBottom">5102851705613406</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">207</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta robada</td>
                            <td class="borderBottom">5105291169837406</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">209</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación</td>
                            <td class="borderBottom">5110556146550527</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">666</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación con antifraude</td>
                            <td class="borderBottom">5103216920074983</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">668</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción denegada por posible fraude</td>
                            <td class="borderBottom">5106248239975235</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">670</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Error en autenticación</td>
                            <td class="borderBottom">5110109669996279</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">678</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Comercio no válido</td>
                            <td class="borderBottom">5111886224425808</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">754</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Contactar emisor</td>
                            <td class="borderBottom">5100538637530152</td>
                            <td class="borderBottom">04/2026</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">191</td>
                        </tr>
                        </tbody>
                    </table>
                </div></div>
`}</HTMLBlock>

- American Express

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
                    <table class="tableBlueDocs">
                        <thead>
                        <tr>
                            <th class="borderLeft text-center">Escenario</th>
                            <th class="text-center">Número</th>
                            <th class="text-center">Mes/año</th>
                            <th class="text-center">CVV</th>
                            <th class="borderRight text-center">Codigo de Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta Vencida</td>
                            <td class="borderBottom">371160951393498</td>
                            <td class="borderBottom">01/2019</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">101</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Fondos insuficientes</td>
                            <td class="borderBottom">371327381068590</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">116</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no registrada</td>
                            <td class="borderBottom">370374318198760</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">118</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no operativa (error de CVV)</td>
                            <td class="borderBottom">371045592151431</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">129</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta inválida</td>
                            <td class="borderBottom">377890880210462</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">180</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción inválida</td>
                            <td class="borderBottom">371448663683011</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">190</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta perdida</td>
                            <td class="borderBottom">371540506350103</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">208</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta robada</td>
                            <td class="borderBottom">371631798378041</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">209</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tienda inhabilitada</td>
                            <td class="borderBottom">371032217060171</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">401</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">La operación ya se encuentra en un depósito</td>
                            <td class="borderBottom">371950721798434</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">476</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Código de comercio no existe o es inválido</td>
                            <td class="borderBottom">371143974183930</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">479</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación</td>
                            <td class="borderBottom">349999481735341</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">666</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación con antifraude</td>
                            <td class="borderBottom">371912610030071</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">668</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción denegada por posible fraude</td>
                            <td class="borderBottom">340010734769274</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">670</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Error en autenticación</td>
                            <td class="borderBottom">371461600047737</td>
                            <td class="borderBottom">01/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">678</td>
                        </tr>
                        </tbody>
                    </table>
                </div></div>
`}</HTMLBlock>

- Diners Club

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
                    <table class="tableBlueDocs">
                        <thead>
                        <tr>
                            <th class="borderLeft text-center">Escenario</th>
                            <th class="text-center">Número</th>
                            <th class="text-center">Mes/año</th>
                            <th class="text-center">CVV</th>
                            <th class="borderRight text-center">Codigo de Acción</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta Vencida</td>
                            <td class="borderBottom">36953865709495</td>
                            <td class="borderBottom">04/2019</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">101</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Fondos insuficientes</td>
                            <td class="borderBottom">36344311372031</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">116</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no registrada</td>
                            <td class="borderBottom">36165277401757</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">118</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no operativa (error de CVV)</td>
                            <td class="borderBottom">36161915044570</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">129</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta inválida</td>
                            <td class="borderBottom">30042507084040</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">118</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción inválida</td>
                            <td class="borderBottom">36552045187919</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">190</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta perdida</td>
                            <td class="borderBottom">36174837286856</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">208</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta robada</td>
                            <td class="borderBottom">36482193207873</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">209</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tienda inhabilitada</td>
                            <td class="borderBottom">36445590978511</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">401</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">La operación ya se encuentra en un depósito</td>
                            <td class="borderBottom">36346782517671</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">476</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Código de comercio no existe o es inválido</td>
                            <td class="borderBottom">36344465159135</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">479</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación</td>
                            <td class="borderBottom">36484318063264</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">666</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación con antifraude</td>
                            <td class="borderBottom">36124375262074</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">668</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción denegada por posible fraude</td>
                            <td class="borderBottom">36165181797514</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom">670</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Error en autenticación</td>
                            <td class="borderBottom">36006973925121</td>
                            <td class="borderBottom">05/2024</td>
                            <td class="borderBottom">111</td>
                            <td class="borderBottom ">678</td>
                        </tr>
                        </tbody>
                    </table>
                </div></div>
`}</HTMLBlock>

- Union Pay

<HTMLBlock>{`
<div class="rdmd-table-large">
<div class="rdmd-table-inner-large container-table-standar scroll-responsive scroll-responsive-vertical">
                    <table class="tableBlueDocs">
                        <thead>
                        <tr>
                            <th class="borderLeft text-center">Escenario</th>
                            <th class="text-center">Número</th>
                            <th class="text-center">Mes/año</th>
                            <th class="text-center">CVV</th>
                            <th class="borderRight text-center">Codigo de Acción</th>
                        </tr>
                        </thead>
                        <tbody>

                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Monto no permitido</td>
                            <td class="borderBottom">6210946888060008</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">113</td>
                        </tr>

                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta no operativa</td>
                            <td class="borderBottom">6210946888080006</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">129</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta inválida</td>
                            <td class="borderBottom">6210946888090005</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">118</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta perdida</td>
                            <td class="borderBottom">6210945888100004</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">207</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Tarjeta robada</td>
                            <td class="borderBottom">6210946888110001</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">209</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Problemas de comunicación</td>
                            <td class="borderBottom">6210945888120002</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">666</td>
                        </tr>

                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Comercio no válido</td>
                            <td class="borderBottom">6210946888140008</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">754</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Contactar emisor</td>
                            <td class="borderBottom">6210946888150007</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">191</td>
                        </tr>
                        <tr class="text-center content-td-table-st">
                            <td class="borderBottom">Transacción denegada por posible fraude</td>
                            <td class="borderBottom">6210946888160006</td>
                            <td class="borderBottom">10/2030</td>
                            <td class="borderBottom">123</td>
                            <td class="borderBottom">670</td>
                        </tr>

                        </tbody>
                    </table>
                </div></div>

`}</HTMLBlock>

#### Casos Pago con Yape

<HTMLBlock>{`
<div class="rdmd-table">
        <div class="rdmd-table-inner container-table-standar scroll-responsive scroll-responsive-vertical">
            <table class="tableBlueDocs">
                <thead>
                    <tr>
                        <th class="borderLeft text-center">Nro de Celular</th>
                        <th class="text-center">OTP</th>
                        <th class="text-center">Descripción del escenario</th>
                        <th class="text-center">YAPE_TRX_TOKEN (tokenId para el API Authorization)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">969929157</td>
                        <td class="borderBottom">557454</td>
                        <td class="borderBottom">000 - Yapero autenticado y habilitado</td>
                        <td class="borderBottom">50561D7634484CE9961D763448ECE923</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">999999999</td>
                        <td class="borderBottom">284563</td>
                        <td class="borderBottom">YPCHK0001 - Cuenta inactiva</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">993355231</td>
                        <td class="borderBottom">784592</td>
                        <td class="borderBottom">YPCHK0002 - Cuenta en blacklist</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">969929157</td>
                        <td class="borderBottom">285743</td>
                        <td class="borderBottom">YPCHK0003 - Límite diario excedido (> 500.00)</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">991055199</td>
                        <td class="borderBottom">378458</td>
                        <td class="borderBottom">YPCHK0004 - Cuenta bloqueada por OTP</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">995555126</td>
                        <td class="borderBottom">678452</td>
                        <td class="borderBottom">YPCHK0005 - Ausencia en F&F</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">969929158</td>
                        <td class="borderBottom">528475</td>
                        <td class="borderBottom">YPCHK0006 - 1er intento de OTP incorrecto</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">969929158</td>
                        <td class="borderBottom">074854</td>
                        <td class="borderBottom">YPCHK0007 - 2do intento de OTP incorreto</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">969929158</td>
                        <td class="borderBottom">875612</td>
                        <td class="borderBottom">YPCHK0008 - 3er intento de OTP incorrecto</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                    <tr class="text-center content-td-table-st">
                        <td class="borderBottom">969929157</td>
                        <td class="borderBottom">000000</td>
                        <td class="borderBottom">YPCHK0010 - OTP no generado</td>
                        <td class="borderBottom">N.A.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
`}</HTMLBlock>

## **API Complementarias**

Puedes revisar los servicios adicionales que tenemos. Revisa el detalle de cada una y los requisitos para integrarlas.

| API Complementarias                                                             |
| :------------------------------------------------------------------------------ |
| [API de confirmación](/v1.1/docs/confirmación-2)                                |
| [API de reversa](/v1.1/docs/api-de-reversa-copy)                                |
| [API de devoluciones](/v1.1/docs/api-de-registro-individual-copy)               |
| [API de consulta devoluciones](/v1.1/docs/api-de-consulta-devoluci%C3%B3n-copy) |

## **Certificación y pase a producción**

✅ Lee todos los pasos [aquí](#popup2)

<HTMLBlock>{`
 <div id="popup2" class="overlay2">
	<div class="popup2 modal-dialog modal-dialog-centered modal-dialog-scrollable">
		<h2>Certificación y pase a producción</h2>
 		<hr>
		<a class="close2" href="/v1.1/docs/bot%C3%B3n-de-pago-1#certificaci%C3%B3n-y-pase-a-producci%C3%B3n" >&times;</a>
		<div class="content2"> 
       <p>A continuación te mostraremos los pasos resumen que debes tener en cuenta para tu Certificación y Pase a Producción.</p>
      <table class="tableBlueDocs">
        <tbody>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-top: 1px solid #03a9f4; border-top-left-radius: 8px; border-bottom:inherit"><strong>Revisa
                y valida el CheckList de Certificación.</strong></td>
            <td class="borderBottom" style="border-top: 1px solid #03a9f4; border-top-right-radius: 8px; border-left: inherit; border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li>Valida cada uno de los puntos que se detallan en la tabla de CheckList de Certificación mostrado en la parte inferior de esta seccion.</li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-bottom:inherit"><strong>Debes contar con un Código de Comercio en producción.</strong></td>
            <td class="borderBottom" style=" border-left: inherit; border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li>Para poder programar tu certificación debes estar afiliado y contar con tu código de comercio.
                    </li>
                    <li>En caso no lo tengas podrás afiliarte a través de: <a href="https://contactos.niubiz.com.pe/afiliateniubiz/pos/" target="_blank" class="color-link-table" style="color: #03a9f4;" rel="noopener noreferrer">https://contactos.niubiz.com.pe/afiliateniubiz/pos/</a>
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-bottom:inherit"><strong>Coordina la fecha de tu Certificación.</strong></td>
            <td class="borderBottom" style=" border-left: inherit; border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li>Código de comercio</li>
                    <li>Datos de la persona que realizará las pruebas de certificación (Nombre, teléfono y correo)</li>
                    <li>3 fechas tentativas y horarios (L a V de 9am a 6pm)</li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom"><strong>Coordina tu Pase a Producción.</strong></td>
            <td class="borderBottom" style=" border-left: inherit;">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li>Durante la certificación podrás realizar el pase a producción o programarlo con un tiempo máximo
                        de 5 días útiles.
                    </li>
                    <li>Durante el pase a producción, revisaremos cada uno de lo puntos que se detallan en "Pasos para tu Pase a Producción" descrita en la parte inferior de esta seccion.</li>    
                </ul>
            </td>
        </tr>
        </tbody>
    </table>

          <blockquote class="callout callout_okay" theme="👍">
            <h3 class="callout-heading false">
              <span class="callout-icon">👍</span>
               </h3><p>
            <em>¡Luego de culminar la certificación y puesta en producción, estás listo para empezar a vender!</em>
            </p></blockquote>

        <h3>Checklist de certificación</h3>
        <p>Requisitos obligatorios que debes tener en tu página web:</p>
      <table class="tableBlueDocs" >
        <tbody>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-top: 1px solid #03a9f4; border-top-left-radius: 8px; border-bottom:inherit; border-right: inherit"><strong>Página
                Principal y de Pago.</strong></td>
            <td   style="  border-top-right-radius: 8px; border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px; ">
                    <li> Debes revisar la sección Consideraciones / Requisitos y Restricciones para que puedas confirmar lo que debes incluir en tu página
                        principal y de pago.
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st"  >
            <td  style="border-bottom:inherit; border-right: inherit"><strong>Sección Contáctenos.</strong></td>
            <td style="border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Debes incluir una dirección de correo electrónico, el teléfono y/o fax y la dirección física de
                        tu comercio, la cual debe incluir la ciudad y el país de ubicación.
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td style="border-bottom:inherit; border-right: inherit"><strong>Carrito de Compras.</strong></td>
            <td style="border-bottom:inherit">
                <p  >Deberá tener los siguientes campos:</p>
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Producto seleccionado</li>
                    <li> Cantidad</li>
                    <li> Monto y moneda</li>
                    <li> Cálculo del IGV (si fuera necesario)</li>
                    <li> Cálculo del Flete (si fuera necesario)</li>
                    <li> Opción de Seguir Comprando</li>
                    <li> Opción de Eliminar</li>
                    <li> Aceptación de los términos</li>
                    <li> Cálculo de cambio de moneda (si fuera necesario)</li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td style="border-bottom:inherit; border-right: inherit"><strong>Página de respuesta con Transacción Autorizada.</strong></td>
            <td style="border-bottom:inherit">
                <p  >Deberá tener los siguientes campos:</p>
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Número de pedido</li>
                    <li> Nombre y apellido del tarjetahabiente</li>
                    <li> Fecha y hora del pedido</li>
                    <li> Importe de la transacción</li>
                    <li> Tipo de moneda</li>
                    <li> Descripción de el/los producto(s)</li>
                    <li> Términos y condiciones o link a la página</li>
                    <li> Texto que indique al cliente que debe imprimir o guardar la información de la página
                        de respuesta, o en su defecto habilitar una opción de impresión.
                    </li>
                    <li> En el caso de compra con puntos o millas, texto que indique al cliente el monto total de la
                        compra, el monto pago con tarjeta y la cantidad de puntos / millas usados.
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td style="border-bottom:inherit; border-right: inherit" ><strong>Página de respuesta Transacción Denegada.</strong></td>
            <td style="border-bottom:inherit">
                <p>Deberá tener los siguientes campos:</p>
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Número de pedido</li>
                    <li> Fecha y hora del pedido</li>
                    <li> Descripción de la denegación</li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td style="border-bottom:inherit; border-right: inherit"><strong>Autenticación.</strong></td>
            <td style="border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Prueba derivando la transacción a autenticar (solo en caso aplique, es decir el flujo
                        transaccional contemple autenticación)
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-bottom:inherit; border-right: inherit"><strong>Merchant Define Data (MDD’s).</strong></td>
            <td class="borderBottom" style="border-bottom:inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Estos valores son obligatorios y se deben ingresar para ayudar a la herramienta de prevención de
                        fraude a realizar una mejor calificación a las transacciones.
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st" >
            <td class="borderBottom" style=" border-right:inherit" ><strong>Términos y Condiciones.</strong></td>
            <td class="borderBottom" >
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Divulgar los términos y condiciones.</li>
                    <li> En la secuencia de las páginas finales antes del checkout, y debe incluir un “clic para
                        aceptar”, una casilla u otro botón de aceptación, o lugar para una firma electrónica, o
                    </li>
                    <li> En la pantalla final de pago cerca del botón “Enviar”.</li>
                    <li> En un pop up o enlace, cuya lectura y aceptación a través de un check box sea obligatoria en la
                        misma página del checkout antes que el tarjetahabiente acepte la compra.
                    </li>
                    <li>
                        Considerar la casilla de aceptación de términos y condiciones no debe de estar premarcardo.
                    </li>
                </ul>
            </td>
        </tr>
        </tbody>
    </table>
      <h3>Pasos para el pase a producción:</h3>
      <p>Considera los siguientes pasos para tu pase a producción:</p>
      <table class="tableBlueDocs">
        <tbody>
        <tr class="text-center content-td-table-st">
           <td class="borderBottom" style="border-top: 1px solid #03a9f4; border-top-left-radius: 8px; border-bottom:inherit; border-right: inherit"><strong>Transacciones
                autorizadas.</strong></td>
            <td class="borderBottom" style="  border-top-right-radius: 10px; border-bottom: inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Transacciones autorizadas con Visa, Mastercard, Amex, Diners y Union Pay</li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-right: inherit; border-bottom: inherit"><strong>Transacciones denegadas.</strong></td>
            <td class="borderBottom" style="border-bottom: inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Transacciones denegadas con Visa, Mastercard, Amex, Diners y Union Pay</li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-right: inherit; border-bottom: inherit"><strong>Autenticación.</strong></td>
            <td class="borderBottom" style="border-bottom: inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Prueba derivando la transacción a autenticar (solo en caso aplique, es decir el flujo
                        transaccional contemple autenticación)
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-right: inherit; border-bottom: inherit"><strong>Liquidación Manual o Automática.</strong></td>
            <td class="borderBottom" style="border-bottom: inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Revisar a nivel de configuración y transacción la liquidación del comercio (manual o
                        automática).
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-right: inherit; border-bottom: inherit"><strong>Anulación.</strong></td>
            <td class="borderBottom" style="border-bottom: inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Revisar el flujo de anulación de una transacción a través de NEL / BO CE / Web / API (según
                        aplique).
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-right: inherit; border-bottom: inherit "><strong>Merchant Define Data (MDD’s).</strong></td>
            <td class="borderBottom" style="border-bottom: inherit">
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Estos valores son obligatorios y se deben ingresar para ayudar a la herramienta de prevención de
                        fraude a realizar una mejor calificación a las transacciones.
                    </li>
                </ul>
            </td>
        </tr>
        <tr class="text-center content-td-table-st">
            <td class="borderBottom" style="border-right: inherit;"><strong>Flujo de Devolución.</strong></td>
            <td class="borderBottom"  >
                <ul class="listPointBlue" style="list-style: none;padding-left: 45px;">
                    <li> Niubiz en línea.</li>
                    <li> Devolución Web.</li>
                    <li> Api de devolución.</li>

                </ul>
            </td>
        </tr>
        </tbody>
    </table>
          <blockquote class="callout callout_okay" theme="👍">
            <h3 class="callout-heading false">
              <span class="callout-icon">👍</span>
               </h3><p>
            <em>¡Luego de culminar la certificación y puesta en producción, estás listo para empezar a vender!</em>
            <div class="tooltip" style="textalign:center">pruebalo aqui

<span class="tooltiptext" style="background-image: url(https://www.niubiz.com.pe/wp-content/uploads/2020/09/img-financieras.png); width:220px; height: 220px; margin-bottom: 28px"></span>

<span class="tooltiptext" style="width:220px; margin-top:15px">parrafo de prueba</span>
</p></blockquote>

    </div>
    	</div>

    </div>

</div>

<style>
body {
  height: 100vh;
}

h1 {
  text-align: center; 
  color: #03a9f4;
  margin: 80px 0;
}
  
.overlay2 {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  transition: opacity 500ms;
  visibility: hidden; 
  opacity: 0;
  z-index: 1;
}
.overlay2:target {
  visibility: visible;
  opacity: 1; 
}

.popup2 {
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  width: 80%;
  height: 80%;
  position: relative;
  transition: all 5s ease-in-out; 
}
   
.popup2 li p{
  height: auto;  
  }
.popup2 h2 {
  margin-top: 0;
  color:#03a9f4;
  text-align: center;
} 
.popup2 .close2 {
position: absolute;
  top: 20px;
  right: 30px;
  transition: all 200ms;
  font-size: 30px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}
.popup2 .close2:hover {
  	color: #03a9f4;
 	 -webkit-transform: rotate(90deg);
  	transform: rotate(90deg);
}
  
.popup2 .content2 {
  	max-height: 90%;
  	overflow: auto; 
    border-color: #03a9f4; 
    /* max-width: 95%; */
    overflow: auto;
    /* margin-right: 15px; */
    border-color: #03a9f4;
    padding-right: 7%;
} 
.popup2 .tableBlueDocs{
    border-collapse: separate;
    border-spacing: 0;
  	margin-left:30px;
  }
  .popup2 .tableBlueDocs tr td{
    border-color: #03a9f4 !important;
    
  }
  .popup2 .tableBlueDocs tr td .listPointBlue li{
  	list-style: disc; 
    font-size: 14px;
  }
   .popup2 .tableBlueDocs tr:last-child td:first-child{
    border-bottom-left-radius: 10px
  }
  .tableBlueDocs tr:last-child td:last-child{
    border-bottom-right-radius: 10px
  }
   .callout.callout{ 
     background: var(--background);
    border-color: var(--border);
    color: var(--text);
    padding: 1.33rem;
  }
  
  
  
  
  
  
  
  
  .tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
  
</style>

`}</HTMLBlock>
