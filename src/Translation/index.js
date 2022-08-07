function getLang(opt) {
  if(!opt.interaction) throw new Error("Please put Interaction option");
  if(!opt.lang) throw new Error("Please define a language!");
  if(!opt.ns) throw new Error("Please define a Namespace!");
  const JSON = require(`./${opt.lang}/${opt.ns}`);
  const lang = JSON;
  return lang;
}
