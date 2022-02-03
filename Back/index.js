const redis = require('redis');
const Promise = require('bluebird');
var cors = require('cors')
const { v4 } = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const express = require('express')
const { uniqueNamesGenerator, colors, animals } = require('unique-names-generator');

const PORT = 5000;

const app = express();
app.use(cors())
const redisClient = Promise.promisifyAll(redis.createClient());

app.get('/bids', getBids)
app.get('/campaigns', getCampaigns)

const REDIS_KEYS = {
  LIST_OF_BIDS: 'LIST_OF_BIDS',
  LIST_OF_CAMPAIGNS: 'LIST_OF_CAMPAIGNS'
};

const STATUS = {
  PENDING: 0,
  ERROR: 1,
  LOSE: 2,
  WIN: 3
};

const bidsToResolve = {};

// making of campaigns
function createCampaigns (numberOfCampaigns) {
  const campaigns = [];

  for (let index = 0; index < numberOfCampaigns; index++) {
    campaigns.push(uniqueNamesGenerator({ dictionaries: [colors, animals] }));
  }
  console.log(campaigns)
  return campaigns;
}

// making of bids
function createBids (numberOfBids, campaigns) {
  const bids = {};
 
  for (let index = 0; index < numberOfBids; index++) {
    const bidId = v4();
    const bidObject = {
      price: _.random(1, 100),
      campaign: campaigns[_.random(0, campaigns.length - 1)],
      status: STATUS.PENDING
    };

    bids[bidId] = bidObject;

    const resolveTime = moment().add(_.random(0, 60), 'seconds').unix();

    if (!bidsToResolve[resolveTime]) {
      bidsToResolve[resolveTime] = {};
    }

    bidsToResolve[resolveTime][bidId] = bidObject;
  }
  console.log('bidovi', bids)
  return bids;
}

async function resolveBids (now) {
  const bids = bidsToResolve[now];

  if (!bids) {
    return;
  }

  await Promise.map(Object.entries(bids), async ([bidId, bid]) => {
    bid.status = _.random(1, STATUS.WIN);

    await redisClient.setAsync(bidId, JSON.stringify(bid));
  });

  delete bidsToResolve[now];
}

async function run (numberOfCampaigns, minBPS, maxBPS) {
  console.log('Running...');

  const campaigns = createCampaigns(numberOfCampaigns);

  await Promise.each(campaigns, campaign => redisClient.saddAsync(REDIS_KEYS.LIST_OF_CAMPAIGNS, campaign));

  while (true) {
    const now = moment().unix();
    const numberOfBids = _.random(minBPS, maxBPS);
    const bids = createBids(numberOfBids, campaigns);

    await Promise.map(Object.entries(bids), async ([bidId, bid]) => {
      await redisClient.setAsync(bidId, JSON.stringify(bid));
      await redisClient.zaddAsync(REDIS_KEYS.LIST_OF_BIDS, now, bidId);
    });

    await resolveBids(now);

    await Promise.delay(moment.duration(1, 'second').asMilliseconds());
  }
}

const [numberOfCampaigns, minBPS, maxBPS] = process.argv.slice(2);

if (!numberOfCampaigns || !minBPS || !maxBPS) {
  console.error('Please include all three parameters');

  process.exit(1);
}

async function getBids(req, res, next) {
  const campaigns = createCampaigns(numberOfCampaigns);
  const numberOfBids = _.random(minBPS, maxBPS);
  try {
    const allBids = createBids(numberOfBids, campaigns);
    console.log(allBids)
    res.send(allBids)
  } catch (err) {
    console.error(err)
    res.status(500)
  }
}

async function getCampaigns(req, res, next) {
  try {
    const campaigns = createCampaigns(numberOfCampaigns);
    res.send(campaigns)
  } catch (err) {
    console.error(err)
    res.status(500)
  }
}

run(parseInt(numberOfCampaigns), parseInt(minBPS), parseInt(maxBPS)).catch(err => {
  console.error(`Failed seeding: ${err}`);
});

app.listen(5000, () => {
  console.log(`App listening on port ${PORT}`)
})
