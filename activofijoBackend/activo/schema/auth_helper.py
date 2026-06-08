import jwt
from django.conf import settings
from datetime import datetime, timedelta

def generate_token(user):
    payload = {
        'user_id': user.id_usuario,
        'email': user.correo,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def get_user_from_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return payload.get('user_id')
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

def get_authenticated_user(info):
    auth_header = info.context.headers.get('Authorization') or info.context.META.get('HTTP_AUTHORIZATION')
    if not auth_header:
        return None
    try:
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].upper() == 'JWT':
            token = parts[1]
            user_id = get_user_from_token(token)
            if user_id:
                from activo.models.rbac import in_usuario
                return in_usuario.objects.get(pk=user_id, estado='ACTIVO')
    except Exception:
        pass
    return None
