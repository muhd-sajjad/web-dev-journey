from .conftest import register_and_login

EXPENSE = {"title": "Lunch", "amount": 12.5, "category": "Food", "date": "2026-01-15"}


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_register_login_me(client):
    headers = register_and_login(client)
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == "alice@example.com"


def test_duplicate_email_is_rejected_case_insensitively(client):
    register_and_login(client)
    r = client.post(
        "/auth/register",
        json={"name": "Other", "email": "ALICE@example.com", "password": "another-pass-1"},
    )
    assert r.status_code == 400


def test_short_password_is_rejected(client):
    r = client.post(
        "/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "short"},
    )
    assert r.status_code == 422


def test_wrong_password_returns_401(client):
    register_and_login(client)
    r = client.post(
        "/auth/login", json={"email": "alice@example.com", "password": "wrong-password"}
    )
    assert r.status_code == 401


def test_login_is_rate_limited_after_repeated_failures(client):
    register_and_login(client)
    bad = {"email": "alice@example.com", "password": "wrong-password"}
    for _ in range(5):
        assert client.post("/auth/login", json=bad).status_code == 401
    assert client.post("/auth/login", json=bad).status_code == 429


def test_expenses_require_auth(client):
    assert client.get("/expenses").status_code == 401


def test_expense_crud(client):
    headers = register_and_login(client)

    created = client.post("/expenses", json=EXPENSE, headers=headers)
    assert created.status_code == 201
    body = created.json()
    assert body["amount"] == 12.5
    assert body["date"] == "2026-01-15"
    expense_id = body["id"]

    listed = client.get("/expenses", headers=headers).json()
    assert [e["id"] for e in listed] == [expense_id]

    updated = client.put(
        f"/expenses/{expense_id}", json={**EXPENSE, "title": "Dinner"}, headers=headers
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Dinner"

    assert client.delete(f"/expenses/{expense_id}", headers=headers).status_code == 200
    assert client.get(f"/expenses/{expense_id}", headers=headers).status_code == 404


def test_expense_validation(client):
    headers = register_and_login(client)
    assert client.post("/expenses", json={**EXPENSE, "amount": 0}, headers=headers).status_code == 422
    assert client.post("/expenses", json={**EXPENSE, "amount": -5}, headers=headers).status_code == 422
    assert client.post("/expenses", json={**EXPENSE, "date": "not-a-date"}, headers=headers).status_code == 422


def test_users_cannot_see_each_others_expenses(client):
    alice = register_and_login(client, "alice@example.com")
    bob = register_and_login(client, "bob@example.com")

    expense_id = client.post("/expenses", json=EXPENSE, headers=alice).json()["id"]

    assert client.get("/expenses", headers=bob).json() == []
    assert client.get(f"/expenses/{expense_id}", headers=bob).status_code == 404
    assert client.delete(f"/expenses/{expense_id}", headers=bob).status_code == 404
