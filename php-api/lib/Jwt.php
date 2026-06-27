<?php
defined('MIRAIA_API_BOOT') or die('Acceso directo no permitido.');

/**
 * Implementación mínima de JWT (HS256) sin dependencias externas (sin Composer).
 * Alcanza perfectamente para firmar/verificar la sesión de admin: un solo
 * algoritmo, sin necesidad de JWKS ni rotación de claves.
 */
final class Jwt
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /** Firma un payload y devuelve el JWT compacto (header.payload.signature). */
    public static function encode(array $payload, string $secret, int $expiresInSeconds): string
    {
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresInSeconds;

        $segments = [
            self::base64UrlEncode(json_encode($header)),
            self::base64UrlEncode(json_encode($payload)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * Verifica firma y expiración. Devuelve el payload decodificado o `null`
     * si el token es inválido, está corrompido o expiró.
     */
    public static function decode(string $token, string $secret): ?array
    {
        $partes = explode('.', $token);
        if (count($partes) !== 3) {
            return null;
        }
        [$headerB64, $payloadB64, $signatureB64] = $partes;

        $signatureEsperada = hash_hmac('sha256', "{$headerB64}.{$payloadB64}", $secret, true);
        $signatureRecibida = self::base64UrlDecode($signatureB64);

        if (!hash_equals($signatureEsperada, $signatureRecibida)) {
            return null; // firma inválida — token alterado o secret distinto
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true);
        if (!is_array($payload) || !isset($payload['exp'])) {
            return null;
        }

        if (time() >= (int) $payload['exp']) {
            return null; // expirado
        }

        return $payload;
    }
}
