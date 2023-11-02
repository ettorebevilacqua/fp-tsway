# maybe functor

Le promise se qualcosa va storto come abbiamo visto, chiamano la funzione catch piuttosto che quella del then, questo permette di creare un bivio-

 Il codice successivo concatenato non viene eseguito e viene ritornata una promise con l errore come valore, sempre leggibile con una funzione definitia nel suo catch.

 Andiamo ora a definire una classe Maybe, che permette di contenere valori e fare map solo se essi non sono nulli, in modo simile alla promise ma solo per i valori nulli come se fossero errori.

 Il nome maybe suggerisce il dire se per caso il valore esiste.

```js
class Maybe {
  static of(x) {
    return new Maybe(x);
  }

  get isNothing() {
    return this.$value === null || this.$value === undefined;
  }

  constructor(x) {
    this.$value = x;
  }

  map(fn) {
    return this.isNothing ? this : Maybe.of(fn(this.$value));
  }

  inspect() {
    return this.isNothing ? 'Nothing' : `Just(${log('my value', this.$value)})`;
  }
}

```

proviamo qualche valore :

```js
Maybe.of('Malkovich Malkovich').map(match(/a/ig)); // Just(True)
Maybe.of(null).map(match(/a/ig)); // Nothing
Maybe.of({ name: 'Boris' }).map(prop('age')).map(add(10)) // Nothing
Maybe.of({ name: 'Dinah', age: 14 }).map(prop('age')).map(add(10)). // Just(24)
```

Vediamo che se cè un valore nullo restituisce se stessa quindi sempre una maybe con il medesimo valore nullo.

Maybe è un funcotr in quanto è presente il metodo map.


## ridefiniamo ancora functor

Ora definiamo una funzione che ci torna comoda, che prende una funzione , successivamente un functor, quindi una classe che implementa map, e quindi esegue il map del functor passando la funzione.

in altre parole questa funzione ci applica la funzione per noi passato un qualsiasi functor

```js
const mapFunctor = f => anyFunctor => anyFunctor.map(f);
```

questo ci torna utile  in quanto se utilizziamo funzioni concatenate, posso avere valori provenienti da functor, cosi in questi casi con questa funzione possiamo accettare functor che quindi implementano map.

Vediamo un esempio con maybe e map

```js
// safeHead :: [a] -> Maybe(a)
const safeHead = xs => Maybe.of(xs[0])

// streetName :: Object -> Maybe String
const streetName = compose(mapFunctor(prop('street')), safeHead, prop('addresses'))

streetName({ addresses: [] })
// Nothing

streetName({ addresses: [{ street: 'Shady Ln.', number: 4201 }] });
// Just('Shady Ln.')
```

compose(mapFunctor(prop('street')), safeHead, prop('addresses'))

safeHead restituisce una maybe con il valore di xs[0] del array xs passato quindi come :

Maybe([{ street: 'Shady Ln.', number: 4201 }) oppure Maybe(null)

quindi prop('street') senza mapFunctor riceverebbe la Maybe e non l oggetto come si aspetta. Con  mapFunctor, passiamo la funzione prop('street') la quale la applica alla maybe di safehead, possiamo vedere il passaggio con codice imperativo cosi :

```js
const maybeHead = safeHead([{ street: 'Shady Ln.', number: 4201 }])
// maybeHead = Maybe([...])
const maybeStreet = mapFunctor(prop('street'))(maybeHead)
// maybeStreet = Maybe('Shady Ln.')
```

come vediamo in modo imperativo , con la variabile intermedia safeHead ho chiamato mapFunctor con doppie parentesi in queso stile mapFunctor()()
in quanto la funzione è in formato curry, speigato in sessione apposita.

streetName quindi con le funzioni chiamate una dentro laltra dal compose per noi, è una funzione che prende in un oggetto una lista di addresse nella suo campo addresses.

Ma se la lista è vuota ?? viene restituita una Maybe(null) e le funzioni concatenate successive non venegono eseguite, quindi viene restituito il valore nullo come facevamo con le promise.

### cosa permette di fare la maybe ??

Fondamentalmente di controllare gli antipatici valori null, una volta imparata e utilizzata con i compose o la concatenazione, risulta indispensabile, e non ci si perde più con questi valori che ci portano a casini.

se vediamo la funzione del suo map, è chiaro che esegue la funzione passato solo se il valore non è nullo.

```js
  map(fn) {
    return this.isNothing ? this : Maybe.of(fn(this.$value));
  }
```

se concateniamo una maybe

```js
const data = { addresses: [] }
Maybe.of(data).map(prop('addresses')).map(head).map(prop('street'))
```

in questo caso ho utilizzato la concatenazione della maybe, senza scomodare il compose che ci permette di inserire altri valori non solo come il map del maybe che restituisce sempre Maybe con un valore.
qui non utilizzo safehead, ma head, sono giù dentro a una maybe se head è vuoto, la maybe si conclude con null.

dopo .map(head) che ritorna Maybe(null) .map(prop('street')
si trova con un valore nullo e quindi ritorna la medesima con null :

  return this.isNothing ? this : Maybe.of(fn(this.$value))

se this.isNothing ritorna la medesima che ha valore null.

quello che ci interessa è che non verrà eseguita la funzione passata, e tutta la catena si limiterà a passare sempre la medesima maybe nulla.

in realtà questa implementazione è molto semplice, la rivedremo meglio implementata, ma per ora va bene perchè si impara bene implementando in modo semplice i concetti, questo codice è molto semplice , la difficoltà è abituarsi a un nuovo stile di programmare, dove poi javascript viene utilizzato per il meglio che si esprime e non in modo limitato.

### un altro esempio

```js
// withdraw :: Number -> Account -> Maybe(Account)
const withdraw = amount => ({ balance }) =>
  Maybe.of(balance >= amount ? { balance: balance - amount } : null);

// This function is hypothetical, not implemented here... nor anywhere else.
// updateLedger :: Account -> Account 
const updateLedger = account => account;

// remainingBalance :: Account -> String
const remainingBalance = ({ balance }) => `Your balance is $${balance}`;

// finishTransaction :: Account -> String
const finishTransaction = compose(remainingBalance, updateLedger);


// getTwenty :: Account -> Maybe(String)
const getTwenty = compose(map(finishTransaction), withdraw(20));

getTwenty({ balance: 200.00 }); 
// Just('Your balance is $180')

getTwenty({ balance: 10.00 });
// Nothing
```
