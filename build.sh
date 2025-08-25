#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Convert SQLite to PostgreSQL for production
if [[ $RAILWAY_ENVIRONMENT == "production" ]]; then
    echo "Production environment detected"
    # Run any database migrations here
    python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
fi
