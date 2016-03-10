# Project Kyou

- Student's Application Winner, National Software Competition 15 (NSC15)
- Secondary School Project Runner-up, Thailand ICT Award 2012
- Secondary School Project Merit Award, Asia Pacific ICT Award 2012

project Kyou's development is sponsored by NECTEC under National Software Competition 2013 program. NECTEC does not offer support for this application.

## Sandstorm

Kyou now supports [sandstorm.io](https://sandstorm.io)!

Download the [spk](https://github.com/whs/kyou/releases/download/sandstorm/kyou.spk) and upload it to your Sandstorm installation.

Difference between locally hosted and Sandstorm version:

- Authentication, access control and sharing system are replaced by Sandstorm's
  - Note that unauthenticated user is still mapped to Kyou's user. As Kyou have no role-based access control everyone (authenticated or not) who have access to the grain will have full control of the project.
- The limit system is configured to have no limits. Some limit checking code have been removed.
- Publishing a standard Chrome ZIP will also make site available via Sandstorm's [web publishing](https://docs.sandstorm.io/en/latest/developing/web-publishing/) system.
- Per Sandstorm's model, only one project is supported in one grain.

## Installation

1. `npm install -g grunt-cli`
2. `npm install .`
3. `grunt` to generate `compiled` folders
4. Copy engine/config.def.php to engine/config.php and fill in values
5. bookfiles and output directories must be writable by the web server
6. Edit planfile.php to configure limit. The "free" plan is hardcoded to be the default

## What's excluded

This release is stripped of some proprietary parts:

- Homepage is removed to authentication screen
- Nonfree parts (anime name and module icons) are removed. Modules will use generic name as seen in commercial version.
- menome integration is removed
- Payment is integrated too deep in the project, so it cannot be removed.