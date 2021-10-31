
[] les gemmes doivent disparaître de la liste des courses 
lorsqu'elles sont achetées (stashAPI avec le cookie sessionID)

[] faire en sorte de rester dans la zone précédente lorsque le joueur va en ville

[] Gears a un problème de mise a jours lorsque l'on recharge les jsons

# Creation de sets
Un bouton "créer un set" => nom, classe, langue
Clone le set actuel dans userdata et le sélectionne

edition en ligne sur la meme fenètre et enregistrement en temps reel.

# avant de pousser

* tester
* packager en local
* mettre a jour le numéro de version dans package.json
* creer le tag local 
```git tag -s -a v0.1.2 -m "auto-release"```
* push en tagant (déclenchera la creation des releases)
```git push origin v0.1.2```
