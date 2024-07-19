

// Creates a CSV file with all users and their post count.

echo "Role,User ID,Email,Post Count,Action" > users_to_audit.csv  # Header for CSV

# Adding 'none' to the role list to handle users without a role
for role in editor subscriber administrator contributor none; do
  if [[ "$role" == "none" ]]; then
    # Special handling for users without a role
    wp user list --role="" --field=ID --format=csv | while read id; do
      post_count=$(wp post list --post_type=post,page --author=$id --format=count)
      email=$(wp user get $id --field=user_email)

      if [[ "$email" =~ @ext\.{searchMatch}(staging|dev)\.wpengine\.com ]]; then
        action="Would delete"
      elif [[ ! "$email" =~ @{searchMatch}\.com$ && ! "$email" =~ @ext\.{searchMatch}\.com$ ]]; then
        action="Would delete (other non-compliant email)"
      else
        action="Would NOT delete"
      fi

      # Format output as CSV and append to file
      echo "\"$role\",\"$id\",\"$email\",\"$post_count\",\"$action\"" >> users_to_audit.csv
    done
  else
    # Handling for specified roles
    wp user list --role=$role --field=ID --format=csv | while read id; do
      post_count=$(wp post list --post_type=post,page --author=$id --format=count)
      email=$(wp user get $id --field=user_email)

      if [[ "$email" =~ @ext\.{searchMatch}(staging|dev)\.wpengine\.com ]]; then
        action="Would delete"
      elif [[ ! "$email" =~ @{searchMatch}\.com$ && ! "$email" =~ @ext\.{searchMatch}\.com$ ]]; then
        action="Would delete (other non-compliant email)"
      else
        action="Would NOT delete"
      fi

      # Format output as CSV and append to file
      echo "\"$role\",\"$id\",\"$email\",\"$post_count\",\"$action\"" >> users_to_audit.csv
    done
  fi
done