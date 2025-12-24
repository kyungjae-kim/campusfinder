package com.bit.docker.lost.model;

public enum Category {
    // 전자기기 (SECURITY 검수 필수)
    ELECTRONICS("전자기기", true),

    // 지갑/신분증 (SECURITY 검수 필수)
    WALLET("지갑", true),
    ID_CARD("신분증", true),

    // 일반
    CLOTHING("의류", false),
    BAG("가방", false),
    BOOK("책", false),
    ACCESSORY("액세서리", false),
    SPORTS("운동용품", false),
    STATIONERY("문구", false),
    ETC("기타", false);

    private final String displayName;
    private final boolean requiresSecurityCheck;  // E4. SECURITY 검수 규칙

    Category(String displayName, boolean requiresSecurityCheck) {
        this.displayName = displayName;
        this.requiresSecurityCheck = requiresSecurityCheck;
    }

    public boolean requiresSecurityCheck() {
        return requiresSecurityCheck;
    }
}