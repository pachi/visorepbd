PRJDIR:=/home/webapps/visorepbd
RESDIR:=${PRJDIR}/deployresources
REPODIR:=${PRJDIR}
BUILDDIR:=build
NGINXCONF:=visorepbd.nginx.conf
# usar variable de entorno EPBDURLPREFIX para cambiar prefijos de static y url para ajax
EPBDURLPREFIX:=/visorepbd/

.PHONY: builddevjs
builddevjs:
	$(info [INFO]: Generando bundle JS para desarrollo)
	npm run builddev
.PHONY: buildjs
buildjs:
	$(info [INFO]: Generando bundle JS de producción)
	npm run buildprod

buildprodjs:
	$(info [INFO]: Generando bundle JS de producción con prefijo de URL $(EPBDURLPREFIX))
	EPBDURLPREFIX=${EPBDURLPREFIX} make buildjs

tryprod:
	$(info "[INFO]: Probando versión de producción en despliegue local")
	npm run buildprod --watch&
	cd build && python3.8 -m http.server

buildwasm:
	$(info [INFO]: Generando paquete wasm)
	cd wasm && wasm-pack build
publishwasm:
	$(info [INFO]: Publicando paquete (debe estar logueado con "npm login"))
	cd wasm && wasm-pack publish

# antes hacer un git pull
update: ${REPODIR}/package.json
	$(info [INFO]: actualizando dependencias)
	cd ${REPODIR} && npm install
	$(info [INFO]: actualización del proyecto completada. Complete la operación con $ sudo make restart)

restart: ${RESDIR}/${NGINXCONF}
	$(info [INFO]: copiando configuración)
	sudo cp ${RESDIR}/${NGINXCONF} /etc/nginx/sites-available/
	$(info [INFO]: reiniciando servicios)
	sudo service nginx restart

npminstall:
	$(info [INFO]: Instalación de nodejs y dependencias JS)
	curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
	sudo apt-get install -y nodejs
	sudo npm install -g eslint babel-eslint eslint-plugin-react http-server webpack webpack-dev-server
	npm install

.PHONY: analyze
analyze:
	$(info [INFO]: Estadísticas de rendimiento de webpack)
	webpack -p --json > stats.json
	webpack-bundle-size-analyzer stats.json

installpackages:
	$(info [INFO]: instalación de paquetes)
	sudo aptitude install nginx git
	sudo aptitude install nodejs nodejs-legacy

configpackages:
	$(info [INFO]: copiando archivos de configuración de nginx)
	sudo cp ${RESDIR}/${NGINXCONF} /etc/nginx/sites-available/
	sudo ln -fs /etc/nginx/sites-available/${NGINXCONF} /etc/nginx/sites-enabled/${NGINXCONF}

${BUILDDIR}:
	mkdir -p ${BUILDDIR}

${BUILDDIR}/test.js: ${BUILDDIR} app/test.js
	./node_modules/.bin/babel --presets es2015,stage-0 -o ${BUILDDIR}/test.js app/test.js

build/examples:
	ln -s ../app/examples ${BUILDDIR}/

test: ${BUILDDIR}/test.js ${BUILDDIR}/examples
	node build/test.js

