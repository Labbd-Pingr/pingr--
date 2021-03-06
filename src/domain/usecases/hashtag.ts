import Hashtag from '../model/hashtag';
import IHashtagDataPort from '../ports/hashtag_data_port';

export default class HashtagUsecases {
  constructor(private readonly hashtagDataPort: IHashtagDataPort) {}

  public async getHashtagByName(hashtag: string): Promise<Hashtag | null> {
    const hashtags = await this.hashtagDataPort.get({ hashtag });

    if (hashtags.length == 0) {
      console.log(`[ERROR] Could not get hashtag with name ${hashtag}`);
      return null;
    }

    return hashtags[0];
  }

  public async updateOrCreateHashtag(hashtag: string): Promise<Hashtag | null> {
    const hashtags = await this.hashtagDataPort.get({ hashtag });

    if (hashtags.length == 0) {
      const newHashtag = new Hashtag(hashtag, 0, 1);
      return await this.hashtagDataPort.create(newHashtag);
    } else {
      const oldHashtag = hashtags[0];
      oldHashtag.dailyCounter++;
      return await this.hashtagDataPort.update(oldHashtag);
    }
  }

  public async updateGlobalCounter() {
    const hashtags = await this.hashtagDataPort.get({});
    const updatedHashtags = [];

    for (let i = 0; i < hashtags.length; i++) {
      hashtags[i].updateGlobalCounter();
      updatedHashtags.push(await this.hashtagDataPort.update(hashtags[i]));
    }

    return updatedHashtags;
  }

  public async topHashtags(): Promise<Hashtag[] | null> {
    const hashtags = await this.hashtagDataPort.get({});

    if (hashtags.length == 0) {
      return null;
    }

    return hashtags.slice(0, 10);
  }
}
