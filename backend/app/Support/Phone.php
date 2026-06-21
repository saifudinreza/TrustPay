<?php

namespace App\Support;

class Phone
{
    /**
     * Normalize an Indonesian phone number to "62..." digits only, so the same
     * number typed as 0812..., +62 812..., or 62812... always matches.
     */
    public static function normalize(?string $raw): string
    {
        $digits = preg_replace('/\D+/', '', (string) $raw);
        if ($digits === '') {
            return '';
        }
        if (str_starts_with($digits, '62')) {
            return $digits;
        }
        if (str_starts_with($digits, '0')) {
            return '62' . substr($digits, 1);
        }
        if (str_starts_with($digits, '8')) {
            return '62' . $digits;
        }

        return $digits;
    }

    /** Pretty form for display: +62 812-3344-4021 (best effort). */
    public static function pretty(?string $raw): string
    {
        $n = self::normalize($raw);
        if ($n === '') {
            return '';
        }

        return '+' . $n;
    }
}
