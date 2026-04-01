require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  Events 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const cooldown = new Map();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'sell') {

      const button = new ButtonBuilder()
        .setCustomId('sell_button')
        .setLabel('🛒 عرض سلعة')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        content: 'اضغط الزر لعرض سلعة',
        components: [row]
      });
    }
  }

  if (interaction.isButton() && interaction.customId === 'sell_button') {

    const lastUse = cooldown.get(interaction.user.id);
    if (lastUse && Date.now() - lastUse < 30 * 60 * 1000) {
      return interaction.reply({ content: '⏳ كل 30 دقيقة فقط!', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId('sell_modal')
      .setTitle('عرض سلعة');

    const item = new TextInputBuilder()
      .setCustomId('item_name')
      .setLabel('اسم السلعة')
      .setStyle(TextInputStyle.Short);

    const desc = new TextInputBuilder()
      .setCustomId('item_desc')
      .setLabel('الوصف (حد 500 حرف)')
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(500);

    const img = new TextInputBuilder()
      .setCustomId('item_img')
      .setLabel('رابط صورة (اختياري)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(item),
      new ActionRowBuilder().addComponents(desc),
      new ActionRowBuilder().addComponents(img)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'sell_modal') {

    const name = interaction.fields.getTextInputValue('item_name');
    const desc = interaction.fields.getTextInputValue('item_desc');
    const img = interaction.fields.getTextInputValue('item_img');

    const channel = await client.channels.fetch(CHANNEL_ID);

    await channel.send({
      content: `🛒 **سلعة جديدة**
👤 البائع: ${interaction.user}
📦 الاسم: ${name}
📝 الوصف:
${desc}
${img ? `🖼️ ${img}` : ''}`
    });

    cooldown.set(interaction.user.id, Date.now());

    await interaction.reply({ content: '✅ تم النشر!', ephemeral: true });
  }
});

client.login(TOKEN);
