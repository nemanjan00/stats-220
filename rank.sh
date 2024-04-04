cat relations.json | jq -r '.[] | .SourceCall' | sort | uniq -c | sort -n | tail -n10
