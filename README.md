# Project Kyou

- Student's Application Winner, National Software Competition 15 (NSC15)
- Secondary School Project Runner-up, Thailand ICT Award 2012
- Secondary School Project Merit Award, Asia Pacific ICT Award 2012

project Kyou's development is sponsored by NECTEC under National Software Competition 2013 program. NECTEC does not offer support for this application.

## Installation

*(I haven't install this in a while, so this is not tested. Also may not work with recent version of softwares?)*

1. `npm install -g gulp`
2. `npm install .`
3. `gulp` to generate `compiled` folders
4. Copy engine/config.def.php to engine/config.php and fill in values
5. bookfiles and output directory must be writable by the web server

## What's excluded

This release is stripped of some proprietary parts:

- Homepage is removed to authentication screen
- Nonfree parts (anime name and module icons) are removed. Modules will use generic name as seen in commercial version.
- menome integration is removed
- Payment is integrated too deep in the project, so it cannot be removed.