import patternCompiler from '../patternCompile'

console.log(patternCompiler('/article/articleId', '/article/123'))
console.log(patternCompiler('/article/:articleId', '/article/abc'))
console.log(patternCompiler('/article/:articleId', '/article'))
