
const yaml = require('js-yaml');
const fs   = require('fs');
const path = require("path");

const configJsonPath= './features/config.json'
const componentTestsSetUpFilePath= '../component_tests_setup.yml'


try {
    const fileComponentTestsSetup = fs.readFileSync(componentTestsSetUpFilePath, 'utf8');
    const componentTestsSetup = yaml.load(fileComponentTestsSetup);
        
    const settingsPath = path.resolve(configJsonPath);
    const settingsFile = fs.readFileSync(settingsPath);
    const config =  JSON.parse(settingsFile)
    
    
    //TODO: alterar todas as chaves e habilitar/desabilitar o arquivo config.js
    config["mockServer"]["api-server"] = componentTestsSetup.services.mockServer.host;
        
    const configJsonUpdated = JSON.stringify(config)
        
    fs.writeFile(configJsonPath, configJsonUpdated, (err) => {
        if (err) throw err;
        console.log("config json updated");
    });

} catch (error) {
    console.error(error);
}


    /*TODO: 
        1 - copiar pasta component-tests
        2 - ler arquivo de configuração component_tests_setup.yml
        3 - alterar docker-compose dos serviços
        4 - ajustar os steps para que fiquem genericos
        5 - pensar no modo de inicialização dos testes...
        6 - criar dockerFile para os testes de componente
        7 - criar docker-compose para executar tudo
    */

