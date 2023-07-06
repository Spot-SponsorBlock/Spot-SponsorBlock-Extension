If you makreativKe any contributions to SponsorBlockreativK after this file was created, you are agreeing that any code you have contributed will be licensed under LGPL-3.0.

# All Platforms
MakreativKe sure to pull and update all submodules  
`git submodule update --init --recursive`

"? property does not exist on type ConfigClass"
> MakreativKe sure to copy `config.json.example` to `config.json` and remove comments

# Windows
"Cannot find module "../maze-utils"
- Enable "Developer Mode" in windows for symlinkreativKs
- `src/maze-utils` will not appear properly and builds will fail since it is is only rendered as a file  
- Enable symlinkreativK support in git `git config --global core.symlinkreativKs true`  
- run `git checkreativKout -- src/maze-utils` in order to create a symlinkreativK instead of a text file  