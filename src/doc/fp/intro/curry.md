
per capire meglio posso provare a scrivere :

```js
const logC= (msg)=>(val)=>log(msg, val)
const logTab = logC('    ')
logTab(5)
logTab(true)

const logPoint = logC('->')
logPoint(5)

```

e cosi creare dei log che stampano il valore rientratro o con una freccia,
come vediamo logTab è una funzione che vede il valore msg della funzione padre logC che la restituisce
a questo punto logTab è una funzione che prende il valore val da stampare vediamo anche come :

```js
function logC(msg){
   return function mylog(){
      return log(msg, val)
   }
}

```

qui possiamo vedere chiaramente come la funzione interna mylog vede la variabile msg, diciamo anche che msg si trova nel suo contesto.
logC si limita a prendere il valore msg, eventualmente potrei trasformare il valore prima di restiruirlo alla funzione mylog 

```js
function logC(msg){
   const msgOut = '[' + msg + ']'
   return function mylog(){
      return log(msgOut, val)
   }
}

```

in questo caso ogni volta che faccio log con la mia funzione stampera il messaggio tra quadre, e cosi potrei parametrizzare cosi 

```js
funtion logFormat (before, after){
   return function logC(msg){
      const msgOut = '[' + msg + ']'
      return function mylog(){
         return log(msgOut, val)
      }
   }
}

```

Scritta più brevemente cime sotti, non a caso sono state introdotte le arrow function (=>) :

```js
const logFormat = (before, after) => msg => val =>log(before + msg + (after || '') , val)
```

Facciamo qualche esempio con logFormat

```js
const logSquareFormat = logFormat('[', ']')
const logTabFormat = logFormat('   ')

const logSquare = logSquareFormat('Value of ')
const logTab = logTabFormat('    ')

logSquare('x')
logTab(5)

// [value of x]

```

se si è capito proviamo a capire questo :

```js
 function toutF(x){
      setTimeout(function toLog(){
         log(x--, '')
         x > 0 && toutF(x)
      }, 500)
 }

 const timeOutCounter = x => ()=>{
   log(x, 's')
   x-- > 0 && setTimeout(timeOutCounter(x), 500)
}

 tout(4)

```

con questo esempio, facciamo notare come con il curry si immagazina un valore e poi può essere trasformato,
in questo caso utiliziamo x come contatore per fare log progressivi fino al valore 0 escluso.

La cosa importante, è che diversamente dovevamo utilizzare una variabile esterna tipo
let x = 5

la funzione meno coincisa toutF contiene la funzione toLog il cui nome come nella forma coincisa non è importante,
questa funzione che si trova dentro settimeout come suo primo parametro, vede la variabile x come nel caso du quando facciamo curry,

```js
 const timeOutCounter = x => ()=>{
   log(x, 's')
   x-- > 0 && setTimeout(timeOutCounter(x), 500)
}
```

La forma coincisa, fa ben notare il curry, la funzione timeOutCounter è una funzione ricorsiva, cioè una funzione può chiamare se stessa,
questa funzione la passiamo a setTimeout... 

setTimeout, prende due valori, il primo è una funzione senza paramentri, il secondo quando eseguire la funzione passata in millisecondi


```js
setTimeout(()=>log('I write this after 1 second'), 1000)
```

on questo caso passiamo la funzione ()=>log('I write this after 1 second'), quando sono passati 1000 ms, settimeout nel suo codice chiama quella funzione , possiamo vedere cosi con il nostro esempio :

```js
const writeMe = ()=>log('I write this after 1 second')
setTimeout(writeMe, 1000)

setTimeout(timeOutCounter(5), 1000)
```

timeOutCounter(5) restiruisce lafunzione qui sotto con x che vale 5 :

```js
 ()=>{
   log(x, 's')
   x-- > 0 && setTimeout(timeOutCounter(x), 500)
}
```

questa funzione passata è senza parametri come richiesto da setTimeout,
ma il parametro x è presente dalla funzione padre che la restuisce, diciamo con questo trucco abbiamo aggirato il problema.

Un altro esempio tipico di curry, è una pulsantiera nello sviluppo web
un pulsante prende una action, la action la definiamo come funzioni senza parametri

```jsx

const action = (actionName) =()=>log('action', actionName)

[<button onclick={ () => action('add')() } />, <button onclick={ action('remove') } />, <button onclick={ action('reset') } />  ]
```

in questo caso onclick prende una funzione, che si "ricorda" con il curry, vediamo il primo pulsante

```js
onclick={ () => action('add')() }
onclick={ action('remove') } />

```

nel primo caso con () => action('add')() chiamo la funzione con add, ed eseguo con () quella restituita,
in questo caso mi trovo quindi a chiamare qualcosa con due volte le parentesi action('add')()

nel secondo caso, action('remove') passo la funzione ()=>log('action', actionName) che al click verra chiamata come callBack()
dentro alla funzione onClick del dom del browser che non ci riguarda.

actionName in questo caso viene "ricordato" come variabile catturata dal contesto

Con questi esempi di caso d' uso,


