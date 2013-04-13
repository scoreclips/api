atm API
=======

State machine:

API for taxi:

1) get nearest atm:

curl -i -X POST -H 'Content-Type: application/json' -d'{"longtitude" : "106.63896", "lattitude": "10.827257" ,"number":"10"}' http://atm.rs.af.cm/atm/distance
