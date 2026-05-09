function generateWithLocalCard(card) {
  return {
    short_reply: card.short_reply,
    long_reply: card.long_reply,
    one_liner: card.one_liner,
    video_script: card.video_script
  }
}

module.exports = {
  generateWithLocalCard
}
