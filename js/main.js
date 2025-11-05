//Objetos importantes de canvas
var canvas = document.getElementById('game');
var ctx = canvas.getContext("2d");
//Crear el objeto de la nave

var juego = {
	estado: 'principio',
};
var nave = {
	x: 100,
	y: canvas.height-40 ,
	width: 30,
	height: 30,
	estado: 0 
}
var textoRespuesta ={
	contador: 0,
	titulo: 'Space Challange!',
	subtitulo: 'Presiona la tecla S para empezar con el nivel 1'
}
var teclado = {}
var audio,sonidoDisparo, sonidoDisparoEnemigo, sonidoNaveMuerta, sonidoEnemigoMuerto, sonidoFinal;
//Array para los disparos
var disparos = [];
var disparosEnemigos = [];
//Arreglo que alacena los enemigos
var enemigos = [];
//Definir variables para las imagenes
var fondo;
var pausa = false, asdf=true,a1=true;
var naveim, alien1,alien2,alien3,alien4, aliens,laser,laserEnemigo,level;
var nivel, puntos=0;
var fondo1,fondo2,fondo3,fondo4;

//Definicion de funciones
function loadMedia(){
	nivel = 0;
	fondo1 = new Image();
	fondo1.src = 'img/fondo1.jpg';
	fondo2 = new Image();
	fondo2.src = 'img/fondo2.jpg';
	fondo3 = new Image();
	fondo3.src = 'img/fondo3.jpg';
	fondo4 = new Image();
	fondo4.src = 'img/fondo4.jpg';
	levels = [fondo1,fondo2,fondo3,fondo4];
	fondo1.onload = function(){
		var intervalo = window.setInterval(frameLoop,1000/55);
	}
	naveim = new Image();
	naveim.src = 'img/nave.png';
	alien1 = new Image();
	alien1.src = 'img/alien1.png';
	alien2 = new Image();
	alien2.src = 'img/alien2.png';
	alien3 = new Image();
	alien3.src = 'img/alien3.png';
	alien4 = new Image();
	alien4.src = 'img/alien4.png';
	aliens = [alien4,alien3,alien2,alien1];
	laser = new Image();
	laser.src = 'img/laser.png';
	laserEnemigo = new Image();
	laserEnemigo.src = 'img/enemyLaser.png';
	sonidoDisparo = document.createElement('audio');
	document.body.appendChild(sonidoDisparo);
	sonidoDisparo.setAttribute('src','sounds/laserSpace.wav');
	sonidoDisparoEnemigo = document.createElement('audio');
	document.body.appendChild(sonidoDisparoEnemigo);
	sonidoDisparoEnemigo.setAttribute('src','sounds/laserAlien.wav');
	sonidoNaveMuerta = document.createElement('audio');
	document.body.appendChild(sonidoNaveMuerta);
	sonidoNaveMuerta.setAttribute('src','sounds/deadSpaceShip.wav');
	sonidoEnemigoMuerto = document.createElement('audio');
	document.body.appendChild(sonidoEnemigoMuerto);
	sonidoEnemigoMuerto.setAttribute('src','sounds/deadInvader.wav');
	sonidoFinal = document.createElement('audio');
	document.body.appendChild(sonidoFinal);
	sonidoFinal.setAttribute('src','sounds/endGame.wav');
	audio =document.createElement('audio');
	document.body.appendChild(audio);
	audio.setAttribute('src','sounds/Music to fly space ships to track 11.mp3');
	sonidoDisparo.volume = 0.2;
	sonidoDisparoEnemigo.volume = 0.2;
}
function dibujarEnemigos(){
	for(var i in enemigos){
		var enemigo = enemigos[i];
		ctx.drawImage(aliens[enemigo.estado],enemigo.x,enemigo.y,enemigo.width,enemigo.height);
	}	
}
function dibujarFondo(){
	ctx.drawImage(levels[nivel],0,0,canvas.width,canvas.height);
}
function dibujarNave(){
	ctx.drawImage(naveim,nave.x,nave.y,nave.width,nave.height);
}
function agregarEventosTeclado(){
	agregarEvento(document,"keydown",function(e){
		//ponemos en true la tecla presionada
		teclado[e.keyCode] = true;
		console.log(e.keyCode);
		console.log(String.fromCharCode(e.keyCode));
	});
	agregarEvento(document,"keyup",function(e){
		//ponemos en falso que dejo de ser presionada
		teclado[e.keyCode] = false;
	});
	function agregarEvento(elemento,nombreEvento,funcion){
		if(elemento.addEventListener){
			//Navegadores de verdad
			elemento.addEventListener(nombreEvento,funcion,false);
		}
		else if(elemento.attachEvent){
			//Internet Explorer :(
			elemento.attachEvent(nombreEvento,funcion);

		}
	}
}
function moverNave(){
	if(teclado[37]){
		//movimiento a la izquierda
		nave.x -= 7;
		if(nave.x < 0) nave.x = 0;
	}
	if(teclado[39]){
		//movimiento a la derecha
		var limite = canvas.width - nave.width;
		nave.x += 6;
		if(nave.x > limite) nave.x = limite;
	}
	if(teclado[32]){
		//Disparos
		if(!teclado.fire){
			fire();
			teclado.fire = true;
		}
	}
	else teclado.fire = false;
}
function dibujarDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		ctx.drawImage(laserEnemigo,disparo.x,disparo.y,disparo.width,disparo.height);
	}
}
function moverDisparosEnemigos(){
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		disparo.y += 3 + nivel;
	}
	disparosEnemigos = disparosEnemigos.filter(function(disparo){
		return disparo.y < canvas.height;
	});
}
function actualizaEnemigos(){
	function agregarDisparosEnemigos(enemigo){
		return {
			x: enemigo.x + enemigo.width/2,
			y: enemigo.y + enemigo.height,
			width: 10 + nave.estado*2,
			height: 20 + nave.estado*5,
			contador: 0
		}
	}
	if(juego.estado == 'iniciando'){
		for(var i=0; i<12; i++){
			enemigos.push({
				x: 10 + (i*40),
				y: 10,
				height: 40,
				width: 40,
				estado: 3,
				contador: 0
			});
		}
		juego.estado = 'jugando';
	}
		for(var i in enemigos){
			var enemigo = enemigos[i];
			if(!enemigo) continue;
			enemigo.contador++;
			enemigo.x += Math.sin(enemigo.contador * Math.PI/90)*5;
			if(aleatorio(0,enemigos.length*10)<4-enemigo.estado){
				sonidoDisparoEnemigo.pause();
				sonidoDisparoEnemigo.currentTime = 0;
				sonidoDisparoEnemigo.play();
				disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			}
		}
		enemigos = enemigos.filter(function(enemigo){
			return enemigo && ((enemigo.estado >-1 && nivel == 3)||(enemigo.estado > 0 && (nivel==2||nivel==1))||(enemigo.estado==3&&nivel==0));
		});
}
function moverDisparos(){
	for(var i in disparos){
		var disparo = disparos[i];
		disparo.y -=6;
	}
	disparos = disparos.filter(function(disparo){
		return disparo.y >0;
	});
}
function fire(){
	sonidoDisparo.pause();
	sonidoDisparo.currentTime = 0;
	sonidoDisparo.play();
	disparos.push({
		x: nave.x + nave.width/2 - 2,
		y: nave.y - 10,
		width: 5,
		height: 5
	});
}
function dibujarDisparos(){
	for(var i in disparos){
		var disparo = disparos[i];
		ctx.drawImage(laserEnemigo,disparo.x,disparo.y,disparo.width,disparo.height);
	}
}
function dibujarTexto(){
	ctx.font= '14pt Arial';
	ctx.fillStyle = 'white';
	ctx.fillText("nivel: "+(nivel+1),0,15);
	ctx.fillText("vidas: "+(4-nave.estado),70,15);
	ctx.fillText("puntos: "+puntos,145,15);
	if(textoRespuesta.contador == -1) return;
	var alpha = textoRespuesta.contador/100.0;
	if(alpha>1){
		enemigos = [];
	}
	ctx.save();
	ctx.globalAlpha = alpha;
	if(juego.estado == 'perdido' || juego.estado == 'victoria'||juego.estado == 'principio'||juego.estado == 'victoriatotal'){
		disparosEnemigos = [];
		ctx.fillStyle = 'white';
		ctx.font = "bold 40pt Arial";
		ctx.fillText(textoRespuesta.titulo,120,200);
		ctx.font= '14pt Arial';
		ctx.fillText(textoRespuesta.subtitulo,120,250);
	}
	ctx.restore();
}
function checkAudio() {
	if(a1)
	{
		if(parseInt(audio.currentTime)==150)
		{
			audio.setAttribute('src','sounds/Music to fly space ships to track 1.mp3');
			audio.play();
			a1=false;
		}
	}
	else
	{
		if(parseInt(audio.currentTime)==140)
		{
			audio.setAttribute('src','sounds/Music to fly space ships to track 11.mp3');
			audio.play();
			a1=true;
		}
	}
}
function actualizarEstadoJuego(){
	
	if(juego.estado == 'jugando' && enemigos.length == 0 && nivel == 3){
		sonidoFinal.play();
		juego.estado = 'victoriatotal';
		textoRespuesta.titulo = 'ERES UN CAMPEON!';
		textoRespuesta.subtitulo = 'Presiona la tecla R para volver a iniciar';
		textoRespuesta.contador = 0;
	}

	if(juego.estado == 'jugando' && enemigos.length == 0 && nivel < 3){
		sonidoFinal.play();
		juego.estado = 'victoria';
		textoRespuesta.titulo = 'Ganaste esta ronda';
		textoRespuesta.subtitulo = 'Presiona la tecla S para iniciar el nivel '+(nivel+2);
		textoRespuesta.contador = 0;
	}
	if(juego.estado == 'jugando' && nave.estado == 4){
		sonidoFinal.play();
		juego.estado = 'perdido';
		textoRespuesta.titulo = "Game Over";
		textoRespuesta.subtitulo = "Presiona la tecla R para volver a iniciar";
		textoRespuesta.contador = 0;
		enemigos = [];
	}
	if(textoRespuesta.contador >= 0)
		textoRespuesta.contador++;
	if(((juego.estado == 'perdido' || juego.estado == 'victoriatotal')&& teclado[82])||((juego.estado == 'victoria'||juego.estado == 'principio') &&teclado[83] )) {
		if(juego.estado == 'principio')
			audio.play();
		if(nivel<3&&juego.estado == 'victoria')
			nivel++;
		else
			nivel = 0;
		if(nivel==0) puntos=0;
		juego.estado = 'iniciando';
		nave.estado = 0;
		nave.y = canvas.height - 40;
		nave.width = 30;
		nave.height = 30;
		textoRespuesta.contador = -1;
		enemigos = [];
		disparos = [];
	}
	if(asdf)
	{if(teclado[80]) {
		asdf=false;
		pausa = !pausa;
		if(pausa)
		{
			ctx.fillStyle = 'white';
		ctx.font = "bold 40pt Arial";
		ctx.fillText("Juego Pausado",120,200);
		ctx.font= '14pt Arial';
		ctx.fillText("Presiona la tecla P para continuar",120,250);
		}
	}}
	else
		asdf=!teclado[80];

}


function hit(a,b){
	var hit = false;
	if(!a||!b) return;
	if(b.x + b.width >= a.x && b.x <= a.x + a.width){
		if(b.y + b.heigth >= a.y && b.y <= a.y +a.height)
			hit = true;
	}
	if( b.x <= a.x && b.x + b.width >= a.x + a.width){
		if(b.y <= a.y && b.y +b.height >= a.y +a.height)
			hit = true;
	}
	if( a.x <= b.x && a.x + a.width >= b.x + b.width){
		if(a.y <= b.y && a.y +a.height >= b.y +b.height)
			hit = true;
	}
	return hit;
}
function verificarContacto(){
	for(var i in disparos){
		var disparo = disparos[i];
		for(j in enemigos){
			var enemigo = enemigos[j];
			if(hit(disparo,enemigo)){
				var max=0, min=5;
				delete disparos[i];
				if(nivel>1)
				{
					for(var k in enemigos){
						estado = enemigos[k].estado;
						max = Math.max(estado,max);
						min = Math.min(estado,min);
					}
					if(enemigo.estado > min || max == min) {
					sonidoEnemigoMuerto.pause();
					sonidoEnemigoMuerto.currentTime = 0;
					sonidoEnemigoMuerto.play();
						enemigo.estado--;
						puntos++;
						if(nivel==3)
							disparos = [];
					}
				}
				if(nivel<2)
				{
					sonidoEnemigoMuerto.pause();
					sonidoEnemigoMuerto.currentTime = 0;
					sonidoEnemigoMuerto.play();
					enemigo.estado--;
					puntos++;
				}
			}
		}
	}
	for(var i in disparosEnemigos){
		var disparo = disparosEnemigos[i];
		if(hit(disparo,nave)){
			sonidoNaveMuerta.pause();
			sonidoNaveMuerta.currentTime = 0;
			sonidoNaveMuerta.play();
			nave.estado++;
			puntos-=10;
			nave.y -= nave.estado*5;
			nave.width += nave.estado*5;
			nave.height += nave.estado*5;
			disparosEnemigos = [];
		}
	}
}
function aleatorio(inferior,superior){
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a);
	return parseInt(inferior) + a;
}
function frameLoop(){
	actualizarEstadoJuego();
	if(!pausa){
	moverNave();
	moverDisparosEnemigos();
	moverDisparos();
	dibujarFondo();
	verificarContacto();
	actualizaEnemigos();
	checkAudio();
	dibujarEnemigos();
	dibujarDisparosEnemigos();
	dibujarDisparos();
	dibujarTexto();
	dibujarNave();}
}
agregarEventosTeclado();
loadMedia();
sonidoFinal.play();