const vsts = require(`./index`);

vsts.findReleases(`demonstrations`, `51aeb1f0-45cf-4837-816b-a1e5cfd326b5`, `wkz4tdzpl37mu2pkysxfotpqb6lolly3w66klyjmwakdqupbh4za`, `yo team`, (e, r) => {
   console.log(r);
});