#!/usr/bin/env sh
set -e
echo "Enter release version: "
read VERSION

read -p "Releasing $VERSION - are you sure? (y/n)" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  # build
  yarn version $VERSION --no-git-tag-version
  VERSION=$VERSION yarn build

  # commit
  git tag v$VERSION
  git add .
  git commit -am "[release] $VERSION"

  # publish
  git push origin refs/tags/v$VERSION
  git push origin master

  yarn publish --access public
fi
