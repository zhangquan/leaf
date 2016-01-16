
var path = require('path');
var webpack = require('webpack');



var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);
var SRC_DIR = 'src';

var config = {
  paths: {
    src: path.join(ROOT_PATH, SRC_DIR),
    out:path.join(ROOT_PATH),
    leaf: path.join(ROOT_PATH, SRC_DIR, 'index.js'),


  },
}


module.exports = {
    entry: {
      leaf:config.paths.leaf,
    },
    output: {
        path: config.paths.out,
        filename: '[name].js',
        sourceMapFilename:"[file].map"
    },
    module: {
      loaders: [

       ]
    },
    plugins:[
      new webpack.HotModuleReplacementPlugin()
    ]
}
