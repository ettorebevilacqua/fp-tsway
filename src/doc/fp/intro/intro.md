# Introduzione

Introduciamo la programmazione funzionale, partendo dal suo aspetto in genere ritenuto più difficile da comprendere,
le monadi. L approccio qui esposto è partire da quello che già utiliziamo ma non sappiamo quale logica ci sia dietro,
le promise in questo caso.

Presa confidenza con le Promise vengono utilizzate senza grossi problemi, cosa faccia dietro le quinte il then e come mai si chiama "then"
modo poco ci importa, se non che nel then passo o definisco una funzione che prende il valore ritornato in ritardo che diciamo in modo asincrono.

Poco ci importa pure come mai possiamo fare :

Promise.resolve(2).them(x= x + 5).then(x= x \* 2).then(x=console.log(x))

in questo caso stamperà 14 dato da 2 + 5 = 7 \* 2 = 14
nemmeno ci poniamo il problema che vedere il valore contenuto nella promise viene letto solo tramite una funzione,
la domanda sarebbe perchè non poter fare Promise.resolve(2).value ?? non sarebbe più semplice ??

Tante domande non le facciamo, per usarle non ci servono, ma le risposte si portano dietro il mondo della programmazione funzionale,
in particolare per le promise, il concetto di valori dentro a dei contenitori.

Partiamo da questo, quello che si studierebbe dopo aver visto diversi concetti, partiamo subito con un programma che dovrebbe essere familiare se si conoscono le promise.

## Un programma di esempio

Partiamo subito da un codice per didattica atipico, proviamo a gestire gli errori con le promise

Struttiriamo il mini programma in :
funzioni di utility
Funzioni di libreria per i calcoli
Bussiness logic
output risultati

```js
// Utility
const log = (msg, val) => (console.log(`${msg} ${val}`), val);
const logC = (msg) => (val) => log(msg, val);
const doError = (msg) => (val) => {
  throw "error of  " + val;
};

// Libreria
const double = (val) => val * 2;
const multiply = (num2) => num1 * num2;
const sum = (num1) => (num2) => num1 + num2;
const divide = (num1) => (num2) => num2 / num1;
const divideThrow = (num1) => (num2) =>
  num1 === 0 ? doError(" divide by 0")(0) : num2 / num1;

// Bussines logic
let promise1 = Promise.resolve(2);
const promiseDoubleSum = promise1.then(double).then(double).then(sum(4));
const promiseDivide = promise1.then(double).then(divide(0));
const promiseDivideError = promise1.then(double).then(divideThrow(0));
const promiseDoError = promise1.then(double).then(doError(" im error"));

// Output risultati
async function main() {
  promiseDoubleSum.then(logC("promiseDoubleSum -----"));
  promiseDivide
    .then(logC("promiseDivide Infinity -----"))
    .catch((e) => logC("-->catch promiseDivide"));
  Promise.resolve(0)
    .then(divide(0))
    .then(logC("divide by 0 NaN -----"))
    .catch(logC("--> catch promiseDivide"));
  promiseDivideError
    .then(logC("promiseDivideError -----"))
    .catch(logC("--> catch promiseDivideError"));
  promiseDoError
    .then(logC("promiseDoError ----"))
    .catch(logC("--> catch promiseDoError"));
}
```

partiamo subito nel vedere questa funzione : logC = (msg) => (val) => log(msg, val)

### Il curry delle funzioni : funzCurry(1)(2)(3) ??

Notiamo la funzione di log e logC nelle utiliry, servono per stampare un valore, ma in due versioni diverse :
logC è una funzione con i paramtri passati in modo curry, in quanto sono passati uno alla volta da una funzione, vediamo meglio :

```js
const logC = (msg) => (val) => log(msg, val);
const logArrow = logC("->"); // msg è una freccia
// logArrow è la funzione (val) => log(msg, val) con msg='->', cioè quello che restituisce logC passato il primo valore.
// da questo punto in poi (val) => log(msg, val) "ricorda" il valore msg
// ogni val stampato è preceduto da ->
logArrow(5); // ->5
logArrow("hello"); // ->hello

// se chiamo direttamente logC i parametri li devo passare uno alla volta tra parentesi,
// in quanto dopo il primo abbiamo una funzione che chiede un singolo parametro che è il nostro secondo parametro,
// la funziome la invochiamo tipicamente con le doppie parentesi.

logC("my val")(4);
```

logC prende il parametro msg ma ritorna una funzione (val)=>log(msg, val)
la funzione (val)=>log(msg, val) prende un paramentro val e chiama log con i due parametri msg e val

il curry delle funzioni è in pratica passare i suoi parametri come funzioni restituite

```js
const funz = (a, b, c) => a + b + c;

// se faccio curry di questa funzione diventa :
const funzCurry = (a) => (b) => (c) => a + b + c;

funzCurry(1)(2)(3); // risultato 5, devo passare i parametri in questo modo

const sumStart3 = funzCurry(1)(2); // qui non chiamo tutti i parametri

// sumStart3 è una funzione che prende il parametro c, cosi mi porto dietro il parziale calcolo 3
// da questo punto in poi sommo partendo dal valore di partenza che qui non vedo 3
sumStart3(10); // 13
```

i parametri sono separati da funzioni, più precisamente dopo ogni parametri viene restituita una funzione che prende altri valori,
certo che non facciamo ul curry per scrivere più verbosamente i parametri tra parentesi ridondanti,
ma ci servono perchè la funzione finale passata, conserva, "ricorda" i valori passati dalle funzioni sue padri,

espressioni del genere ci permettono di applicare parzialmente i valori, e definire nuove funzioni che conservano i parametri già passati :

const sumStart3 = funzCurry(1)(2) // qui non chiamo tutti i parametri
sumStart3(10) // 13

Un aspetto interessante è che solo quando passo l ultimo parametro la funzione fa il calcolo, evitando quindi eventuali calcoli ripetuti intermedi.

L argomento più completo su curry lo trovato nel capitolo curry, per chi a digiuno consiglio rispetto a questa breve esposizione.
l importante è non stranirsi vedendo funzioni chiamate con questo stile :

funzCurry(1)(2)(3)

## Esaminiamo il codice

Il codice principalmente applica delle funzioni di calcolo e controlla eventuali errori.
Se vengono sollevate eccezzioni nelle funzioni passate al then delle promise, le promise le gestiscono mettendo l errore nel ramo catch
della promise.

In caso di errore l esecuzione del codice continua, vediamo i risultati :

divide by 0 NaN ----- NaN
promiseDivide Infinity ----- Infinity
promiseDoubleSum ----- 12
--> catch promiseDivideError error of 0
--> catch promiseDoError error of 4

vediamo che se non ci sono errori viene eseguito il ramo then, se no catch.
un altra cosa che possiamo notare che il codice non presenta if ed è chiaro nelle sequenza che fa.

Le promise non nascono per queste operazioni, ma si comportano da Container, o meglio da functor, cosa significa ?

quando faccio let promise1 = Promise.resolve(2); creo una promise che contiene il valore 2
per vedere questo valore, utilizzo .then(funzione) con dentro una funzione, una qualsiasi ?
no, una funzione con un parametro, la promise chiama questa funzione per noi passando come parametro il valore della promise :

non esiste quindi che io possa fare qualcosa come :

```js
promise1.value;
```

il valore lo posso leggere solo passando per una funzione.... il perchè è facile per le promise :
il suo valore è presente nel futuro, inizialmente non esiste, eppure con esse rappresentiamo un valore ancora non presente.

```js
const myApi = http.get("https://api.com/myapi");
console.log(myApi.value); // non esiste .value e non ha senso,
// se fosse possibile si proverebbe a leggere un valore non esistente, che sarà presente nel futuro
myapi.then((value) => console.log(value)); // il value esiste solo al termine della chiamata http, e cosi chiama la funzione
myapi.then(renderProduct); // una ipotetica funzione che visualizza i dati ricevuti
```

Le promise quindi sono come dei container attorno a valori ancora non esistenti, e quando arrivano chiama la callback passata
La promise non fa altro che chiamare la nostra funzione al momento giusto, è resposabilità della nostra funzione cosa fare del valore,
non della promise, che si limita a fornire la funzione then e se ci sono errori chiamare la funzione del catch se definita.

A noi ci interessa questo comportamento da container, nelle promise in altre parole non avendo inzialmente un valore,
non risulta difficile il suo concetto, ci si abitua presto, le difficoltà sono per se questi container vengon utilizzati per
scrivere codice con uno stile molto diverso dalla programmazione imperativa.

## La concatenazione

Una prima caratteristica che in javascript è normale ed è molto utilizzata è la concatenazione :

.them(double).them(sum(5))

come anche concateniamo stringhe o array cosi :

'hello'.toUpperCase().concat(' word').split(' ').map(str => '(' + str + ')') // ['(HELLO)', '(word)']

Con la concatenazione, il valore iniziale lo vedo come una serie di trasfomarzioni tramite delle funzioni successive.

### Il termine trasformare

con gli esempi precedenti della concatenazione ho voluto forzare questo concetto, il valore trasmormato,
quello che vediamo è che non ci sono variabili intermedie :

```js
const hello = 'hello'
let tmp = hello.toUpperCase()
tmp = tmp.concat(' word')
tmp = tmp.split(' ')
.....
result = tmp

// qui vedo più chiaramente la serie di trasformazone del valore :

'hello'.toUpperCase().concat(' word').split(' ').map(str => '(' + str + ')') // ['(HELLO)', '(word)']
```

il codice risulta più lineare più coinciso e senza altre variabili nel mezzo, è più chiara la catena della trasformazione.
**quello che dobbiamo abituarci è non vedere variabili che cambiano valori, ma valoiri che vengono trasformati**

questa è la concatenazione, o motivo per cui si tende a usare le variabili definite come costanti, andiamo a vedere.

## l uso di variabili costanti

modifichiao il codice precedente senza usare la comoda variabile dichiarata con let, e usiamo solo costanti.
Sono costretto a scrivere codice cosi con solo le costanti :

```js
const hello = 'hello'
const helloUpper = hello.toUpperCase()
const helloWord = helloUpper.concat(' word')
const listWord = helloWord.split(' ')
const listwordInBrackets = .map(str => '(' + str + ')')

const msg = ' my string ' + helloWord + listwordInBrackets.join('-')
// msg = (hello)-(word)

```

Il codice moderno professionale usa quanto possibile le costanti, sembra una contradizione, le variabili che non variano !!
Questa contradizione è una mentalità nella programmazione che porta al maggior numero di bug, js aveva inzialmente solo var
per definire le varibili, oggi ha perso senso e si usa quanto meno possibile il let e il const.

Se uso quanto meno possibile il let, ho più visibile quali sono le variabili pericolose, che variano di valore.
In generale, diciamo che ci proteggiamo quanto piùù possibile da varibili che impazziscono con valori errati,
che sono poi difficilmente individuabili.

La strada maestra è l' uso di costanti, e costrutti quali la concatenazione che evitano varibiali intermendie.
il codice sopra, è più lungo da scrivere, e per ogni variabile, devo sforzare a pensare a un nome adeguato.

Questo ci evita di evitare variabili di valori temporanei, ma ci forza a dare un nome adeguato ad ogni passaggio,
o meglio.... **AD OGNI TRASFORMAZIONE** del valore iniziale, il nome giusto è il nome del dato come è stato trasformato.
Anche se andiao più lenti, siamo soggetti a meno bug anche di distrazione, il flusso è chiaro e quando si va a modificare
il codice è più maneggevole.

const helloWord = helloUpper.concat(' word')
const listWord = helloWord.split(' ')

### Trucchi sui nomi, rimaniamo generici

qui ho cambiato il nome da helloWord, in listWord, perchè a quel punto non mi importa che parole sono ma che ho una lista di parole,
il nome hello word sarebbe più coretto come param, startValue se proprio non so come chiamarlo, come se fosse il parametro di una funzione.

```js
const param = "hello";
const paramUpper = param.toUpperCase();
const paramWords = helloUpper.concat(" word");
```

con param rimango più generico nei nomi, le strighe tendono a cambiare facilmente, domani anzichè hello potremo passare una valore,
e questo è un tipico refactory, magari perchè messo il codice dentro una funzione separata che prende param come valore.
Con il nome generico devo fare meno cambiamenti al codice.
il giusto nome rappresenta il tipo di operazione e mai si riferisce a ipotetici valori.

in questo scenario però, dove per buon codice dobbiamo scrivere variabili constanti con nomi adeguati la concatenaziobe
ci evita un bel lavoro di variabili intermedie, dove **le variabili sono le fonti di quasi tutti i bug** :

'hello'.toUpperCase().concat(' word').split(' ').map(str => '(' + str + ')')

**insisto nel abituarsi a vedere i valori che si trasformano e non che si modificano o variano**,
questo ci aiuta sia a scrivere buon codice,ma ci aiuta a comprendere succesivamente concetti che risultano ostici senza certe premesse,

I nomi che assegnamo sono la cosa più importante, i nomi giusti ci evitano di scrivere commenti nel codice.
Anche il flusso del programma deve essere chiaro e che non sente il bisogno di commenti del codice, e qui che noi ci concentriamo
**la gestione del fusso**.

## concatenzazione il vantaggio e il compose

Diciamo quindi anche con il then concatenato, eseguiamo linearmente seguendo il flusso una serie di operazioni,
il vantaggio della concatenzione, è che mi evita variabili intermedie :

```js
.then(double).then(sum(5).then(logC('risultato')))
```

ma posso anche concatenare, annidando le funzioni passandole eseguite nei parametri :

```js
sum(double(2))(5); // (2 * 2) + 5 = 9

// potrei continuare con
double(sum(double(2))(5)); // 2 * ( (2 * 2) + 5 ) = 18
```

Ma casco nel antipatico annidamento, il quale inverte pure il flusso,
sum(double(2))(5), sum appare per prima di double, confonde a leggere raddoppia 2 e somma 5,
sotto invece raddoppia 2 e somma 5 e raddoppia

l' ideale sarebbe poter scrivere qualcosa del genere

```js
const nextVal = compose( logC('risultato'), sum(5), double)
const nextVal(3) // risultato = 11

```

una funzione compose, che compone più funzioni insieme, come facevamo con la concatenzazione, potrei scrivere in modo complesso

```js
const calcSpeed = compose( multiply(3), sum(5), double )
compose( logC('risultato', calcSpeed(3) ) // risultato = 33

```

in questo caso compose mi restituisce una funzione che prende un parametro di valore iniziale,
e lo passa alla lista delle sue funzioni passate come parametri nella sua definizione

calcSpeed(3) esegue chiaramante come indicato nei parametri di compose, un chiaro flusso da destra a sinistra.

Con i calcoli questo concetto può essere meno chiaro, perchè disturba il pensiero perchè scomodare tutta sta roba
per fare

```js
const calcSpeed = x => ( (x * 2 ) + 5 ) * 2  // compose( multiply(3), sum(5), double )
compose( logC('risultato', calcSpeed(3) ) // risultato = 33

```

come risposta è come esempio, chiaro che per piccole operazioni scrivi nel ultimo modo,
ma fate caso, che se voglio complicare l espressione , casco sempre nel annidazione

```js
const calcSpeed = (x) => 2 * (3 + (x * 2 + 5) * 2);
const calcSpeed2 = compose(double, sum(3), multiply(3), sum(5), double);
```

messe vicine chi sono più leggibili nel secondo caso da destra verso sinistra ??
altro esempio più tipico :

```js
const prop = (name) => (obj) => obj[name];
const head = (list = list[0]);
const upper = (s) => s.toUpperCase();

const cityPerson = compose(upper, prop("city"), head, prop("andress"));

const person = { name: "mattia", andress: [{ city: "rome" }] };
const city = cityPerson(person);

// cityPerson = 'Rome'
```

come possiamo vedere nel ultima riga a me interessa il nome cityPerson, che mi dice che restituisce la prima città degli indirizzi
passata una persona definita con quei campi

quando leggo il programma dopo city = a me non interessa come abbia preso city, ma che sia quel valore,
magari per fare statistica divisa per città

ma se qualcosa non va bene, o domani cambio il codice, velocemente vedo il flusso su compose

```js
compose(upper, prop("town"), head, prop("andress"));
// errore ho scritto town anzichè city !!
```

dentro a compose posso aggiungere o cambiare metodi velocemente con meno possibilità di creare errori,
gli errori possibili sono passare funzioni con paramentri incompatibili, ed errori di **logica di flusso**.

**Come vediamo la funzione compose, ci può aiutare molto nel concatenare funzioni senza fare annidamenti,
in questo modo la lettura del flusso di trasformazioni è lineare e facile da seguire.**

### La logica di flusso

Tornando al codice inziale, abbiamo utlizzato le promise per contenere dei valori
nel container promise, facciamo la concatenazione con la pila di then, delle trasformazioni del valore contenuto.
il motivo per cui posso fare .then(),then() concatenato è che la funzione .then() non restituisce il valore,
si limita a chiamare la funzione passata con il valore della promise da passare, ma restituisce una nuova promise
con il nuovo valore trasformato dalla funzione passate

let promise1 = Promise.resolve(2);
const promiseDoubleSum = promise1.then(double).then(double)

promiseDoubleSum qui è sempre una promise che contiene il nuovo valore 8, e cosi ad essa posso successivamente continuare con :

const newPromise = promiseDoubleSum.then(sum(3))

newPromise è sempre una proise che contiene il valore, diciamo cosi che il valore non lascia mai la promise e noi lo leggiamo solo tramite
una funzione di callback, ma questo ci permette di concatenare al infinito.

## Il controllo degli errori

Questo codice è una forzatura per mostrare le operazioni nei contaneir, ma un aspetto che torna utile e potrebbe essere sensato il suo uso,
è il controllo degli errori :

```js
const promiseError = promise1.then(double).then(doError(" im error"));
promiseError
  .then(logC("promiseDoError ----")) // qui non viene mai eseguita con il valore di errore.
  .catch(logC("--> catch promiseDoError"));
```

la funzione doError genera un errore grave di throw, ma questo non blocca il programma.

la promise se nel eseguire la funzione passata al then va in errore, tramite un try catch controlla l errore e chiama per
noi  se definita la funzione nel catch

Questo comporta che mentre eseguo le varie trasformazioni con le funzioni passate, se qualcosa va male,
la promise prende il valore del errore, e interrompe la concatenzazione, in pratica non esegue più le funzioni passate, ma come dicevamo
se non quella del catch appositmente prevista per gli errori.

```js
const promiseError = promise1.then(double).then(doError(" im error"));
const newPromiseError = promiseDoError
  .then(logC("promiseDoError ----")) // qui non viene mai eseguita con il valore di errore.
  .catch(logC("--> catch promiseDoError"));

newPromiseError.then(logC('non vengo eseguito')).catch(logC("visualizza di nuovo l errore precedente"));
```

newPromiseError non eseguira mai il then ma se richiamato il catch visualizza lo stesso errore, anche se ho cambiati il messaggio del log,
da questo punto in poi, qualsiasi then o cactch restituisce sempre lo stesso errore.

questo è un grosso vantaggio, in quanto non ci preoccupiamo più di scrivere il codice di controllo degli errori,
ma facciamo qualcosa solo alla fine se qualcosa va male chiamando la funzione di callback.

In questo modo la promise gestisce la biforcazione del flusso, la particolarità è che sono assenti delle tipiche e inevitabili if
di controllo del flusso.

Come per i let, varibiali intermedie, e annidazioni le if non ci piacciono e cerchiamo di evitarle,
il motivo è che oltre a tendere a creare nidificazioni, complica la lettura del codice rispetto a cosa stia effettivamente facendo,
rispetto a come controllare che tutto vada bene, e non trovo cosi blocchi di codice seperati che controllano i due casi.

Detto questo, le if si tende a sostituirle in piccole operzioni con gli operatori ternari

```js
const calc1 = (a, b) => (a + b) / 2
const calc2 = (a, b, c ) => calc1(a, b) + c
const ris = (a, b, c, d) => d && ( (a && b ) || (a && c) ) || c | (a && b)
   ? calc1() : calc2()
```

in questo caso dopo una complessa valutazione, chiamiamo calc1 o calc2, le funzioni ternarie se non restituiscono valori semplici,
meglio sempre resituire i due rami con una funzione, come nelle promise.

Ma completiamo il discorso con una importante ottimizzazione a cui consiglio caldamente di prestare attenzione,
dove ci serve anche per comprendere meglio il discorso.


Il motivo di "comprendere il discorso", è che qui viene proposta la programmazione funzionale con i suoi costrutti più ostici, quali le monadi,
i functor ecc, ma questi costrutti servono per scrivere meglio il codice, codice che può essere scritto in molti modi diversi.

E' inutile utilizzare strumenti potenti quando si scrive del codice non strutturato diciamo... del male codice.
Scrivere buon codice è un arte, come scriverlo bene ci sono molti studi e approcci diversi, ma ci sono delle regole che se seguite
senza che dobbiamo stidiare grandi cose, ci permette di scrivere codice elegante, professional, facile da leggere e mantenere.

Qui ho in pratica introdotto metodologie di come meglio scrivere il codice, per esempio l uso delle costanti, la concatenazione ecc,
in particolare ho fatto notare come l uso delle costanti forza la nomenclatora dei valori, e cosi si nota la trasformazione dei valori

ma vediamo un altro particolare che ritengo importante, abituarsi a scrivere tante piccole funzioni p valori 
specie se in linea con le arrow funcion , riscriviamo il codice precedente :

```js
const media = (a, b) => (a + b) / 2
const mediaSum = (a, b, c ) => calc1(a, b) + c


const ris = (a, b, c, d) =>{
  const is_ab = a && b
  const is_ac = a && c
  const is_abc = is_ab || is_ac
  const is_c_ab = c || is_ab
  const is_d = d && is_abc || is_c_ab

  return is_d ? media() : mediaSum()
}
```

l espressione d && ( (a && b ) || (a && c) ) || c | (a && b) l' ho spezzata in tanti piccoli valori booleani con variabili
con nome prededute da is, ho forzato la mano, ma per fa notare come is_d da passare alla if ternaria sia di veloce lettura,
poi andiamo a risalire verso l altro nella lettura del codice per i dettagli.

Dal basso verso l altro nedo dettagli e implementazioni, ma verso la fine mi interessa cedere chiaramente cosa sto facendo,
in questo caso valuto il parametro d con il resto dei parametri, e cosi chiamo o media o mediaSum.

se tutto funziona bene a me interessa vedere is_d ? media() : mediaSum() per capire cosa stiamo facendo anche al volo,
sopratutto quando scorro il codice in giro, questo è il controllo del flusso che in genere ci perdiamo qua e la nel codice
non organizzato per seguirlo.

Inoltre questo esempio suggerisce quanto più l' approccio che scrivere piccole espressio o funzioni, con la giusta semantica,
oltre ad aumentare la leggibilità, favorisce :

il riutilizzo, devo controllare banali espressioni,
evito le annidazioni
una modifica alle condizioni iniziali modifica in cascata e meno errori sul codice da modificare qua e la
posso miscellare facilmente tra loro le espressioni se devo fare esperimenti o prove.

la funzione compose, ci aiuta molto a comporre appunto piccole espressioni :

```js

const prop = obj => field => obj[field]
const head = list => list[0]

const streetName = compose( prop('street'), head, prop('addresses') );

const data = { addresses: [{ street: 'Shady Ln.', number: 4201 }] }
sstreetName(data); // 'Shady Ln.'

```

in questo caso notiamo come con piccole funzioni e composo, sono utili per leggere valori dentro a oggetti complessi.

## Prepariamoci al successivo step

quello che qui abbiamo visto si riassume in questi punti, è importante prendere confidenza con questi concetti e il codice che abbiamo esposto che si presenterà molto in questo stile esposto.

promise e contenitori di valori
curry delle funzioni
trasformazione dei valori piuttosto che loro modifica
concatenazione delle funzioni
la funzione di compose per concatenare funzioni
il controllo degli errori
utilizzo delle costani

Andiamo a vedere meglio il concetto di container per poi passare al concetto dei functor e monadi.