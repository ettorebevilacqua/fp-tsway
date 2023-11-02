# il mio primo container


Prepariamo una classe che ci permette di fare da contenitore a un valore.

```js
class Container {
  constructor(x) {
    this.$value = x;
  }

  static of(x) {
    return new Container(x);
  }
}

Container.of(3); // Container(3)
Container.of('hotdogs'); // Container("hotdogs")
Container.of(Container.of({ name: 'yoda' })); // Container(Container({ name: 'yoda' }))

```

come vediamo per ora, abbiamo creato questa classe che contiene un $value come valore settato nel costruttore,
notiamo però il metodo statico of, esso prende un valore e crea l 'istanza del container.

non utilizziamo quindi mai il container come new Container(3) ma utilizziamo il metodo of, vedremo come mai rispetto al costrutttore.

Ora aggiungiamo un funzione chiaata map, che ci permette come facevamo con le then delle promise di fare qualcosa con una funzione passata con quel valore, ma come per le promise, ho come ritorno il valore trasfomato dalla funzione passata, contenuto in un Container.

```js
Container.prototype.map = function (f) {
  return Container.of( f(this.$value) );
};

Container.of(2).map(two => two + 2); // Container(4)
Container.of('flamethrowers').map(s => s.toUpperCase()); // Container('FLAMETHROWERS')
Container.of('bombs').map(append(' away')).map(prop('length')); // Container(10)
```

ed ecco il nostro container che fa la concatenazione con map, come le promise con then !!
il map fa questa banale magia esegue la funzione e passa il valore a un nuovo container :

 return Container.of( f(this.$value) );

 f(this.$value) applica la funzione passata dal map,
 Container.of raccoglie il valore trasfomato dalla funzione in un nuovo container che restituisce

 Il risultato di Container.of('bombs').map(append(' away')).map(prop('length'))
 non è 10, ma Container(10) il valore è dentro una classe Container come il log chiaramente indica.


## functor : abbiamo creato un contenitore mappabile

quello che abbiamo fatto è appunto creare un contenitore mappabile
nella teria delle categorie chiamiamo functor qualcosa che si può mappare.

Anche gli array hanno un metodo map che si applicca sui suoi elementi uno a uno

ma pure le promise hanno il map, solo che lo chiamiamo then, per distinguerlo dal map che è sincrono e il then delle promise asincrono.

Quando parliamo qualcosa di mappabile, intendiamo che quel qualcosa ha una funzione di map che permette di leggere o trasformare  i valori in altro, ricordiamo che qui non si intende cambiare i valori ma trasformarli.

la funzione di map si comporta in altre parole come una tipica callback.

### Cosa è quindi un functor ?

E' un contenitore dicevamo, ma sopratutto una interfaccia, un contratto, delle regole diciamo pure, che definosce come deve essere fatto il contenitore cioè deve avere :

of per assegnare un valore incapsulato come contenitore,
map per poterlo leggere ed elaborare, e resituire dentro allo stesso tipo di contenitore.

cosa fa il functor con il map in altre parole ??
con map gli chiediamo di applicare le funzioni per noi al suo interno

questo concetto apparentemente banale, che sembra complicare inutilmente le cose, vederemo che è molto potente, e ci permette di trattare il codice in modo più efficente.

Andiamo ora ad estendere questa classe Container, per creare cose utili rispetto al semplice e solo map di funzioni.

Andiamo a vedere il container maybe.
