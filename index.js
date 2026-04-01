require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  Events 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

// 🟢 حط 7 قنوات هنا
const CHANNELS = {
  c1: "1488907274373173380",
  c2: "1488907304672821449",
  c3: "1488907327456284692",
  c4: "1488907450345324566",
  c5: "1488907523355443281",
  c6: "1488907566439338105",
  c7: "1488907355138560100"
};

const cooldown = new Map();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {

  // أمر /sell
  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'sell') {

      const menu = new StringSelectMenuBuilder()
        .setCustomId('select_category')
        .setPlaceholder('📂 اختر القسم')
        .addOptions([
          { label: 'الحسابات', value: 'c1' },
          { label: 'االعاب', value: 'c2' },
          { label: 'ديسكورد', value: 'c3' },
          { label: 'بروبوت', value: 'c4' },
          { label: 'طرق', value: 'c5' },
          { label: 'سيرفرات', value: 'c6' },
          { label: 'اخرى', value: 'c7' }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        content: 'اختر وين بدك تنشر السلعة:',
        components: [row]
      });
    }
  }

  // عند اختيار القسم
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_category') {

    const category = interaction.values[0];

    const lastUse = cooldown.get(interaction.user.id);
    if (lastUse && Date.now() - lastUse < 30 * 60 * 1000) {
      return interaction.reply({ content: '⏳ فقط كل 30 دقيقة!', ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId(`sell_modal_${category}`)
      .setTitle('🛒 عرض سلعة');

    const name = new TextInputBuilder()
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
      new ActionRowBuilder().addComponents(name),
      new ActionRowBuilder().addComponents(desc),
      new ActionRowBuilder().addComponents(img)
    );

    await interaction.showModal(modal);
  }

  // بعد إرسال النموذج
  if (interaction.isModalSubmit() && interaction.customId.startsWith('sell_modal_')) {

    const category = interaction.customId.split('_')[2];
    const channelId = CHANNELS[category];

    const name = interaction.fields.getTextInputValue('item_name');
    const desc = interaction.fields.getTextInputValue('item_desc');
    const img = interaction.fields.getTextInputValue('item_img');

    const channel = await client.channels.fetch(channelId);

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
